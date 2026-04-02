import { User } from '../model/user.model.js';
import { sendEmail } from '../services/email.service.js';
import { welcomeEmailTemplate, passwordResetEmailTemplate } from '../services/email.template.js';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';



const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});


const setRefreshTokenCookie = (res, rawToken, rememberMe) => {
  const maxAgeMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    :      24 * 60 * 60 * 1000;

  res.cookie('refreshToken', rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAgeMs,
    path: '/api/auth',
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  });
};



const registerUser = async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }

    const { username, email, password } = result.data;

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.toLowerCase().trim() },
      ],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase().trim() ? 'Email' : 'Username';
      return res.status(409).json({ message: `${field} is already in use` });
    }

    const user = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    try {
      const { subject, html } = welcomeEmailTemplate(user.username);
      await sendEmail({ to: user.email, subject, html });
      console.log(`✅ Welcome email sent successfully to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ Welcome email failed:', emailErr.message);
      console.error('Email error details:', emailErr);
    }

    return res.status(201).json({
      message: 'Registration successful',
      user: { userId: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }

    const { email, password, rememberMe } = result.data;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = user.generateAccessToken();
    const rawRefreshToken = await user.generateRefreshToken(rememberMe, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    setRefreshTokenCookie(res, rawRefreshToken, rememberMe);

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: { userId: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      'refreshTokens.tokenHash': tokenHash,
      'refreshTokens.expiresAt': { $gt: new Date() },
    });

    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const tokenEntry = user.findRefreshToken(rawToken);
    if (!tokenEntry) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const remainingMs = tokenEntry.expiresAt - Date.now();
    const rememberMe = remainingMs > 24 * 60 * 60 * 1000;

    await user.revokeRefreshToken(rawToken);
    const newRawRefreshToken = await user.generateRefreshToken(rememberMe, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    const newAccessToken = user.generateAccessToken();
    setRefreshTokenCookie(res, newRawRefreshToken, rememberMe);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;

    if (rawToken) {
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await User.updateOne(
        { 'refreshTokens.tokenHash': tokenHash },
        { $pull: { refreshTokens: { tokenHash } } }
      );
    }

    clearRefreshTokenCookie(res);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.revokeAllTokens();
    clearRefreshTokenCookie(res);

    return res.status(200).json({ message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
};

const checkEmailExists = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Username or email is required' });
    }

    // Check if input is email or username format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(email);

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: email.toLowerCase().trim() },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please check your username or email.' });
    }

    // Return user info (username only, for privacy)
    return res.status(200).json({
      message: 'Account found',
      exists: true,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log('📧 Forgot password request for:', email);

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // For security, always return success even if user doesn't exist
    if (!user) {
      console.log('⚠️  User not found with email:', email);
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }

    console.log('👤 User found:', user.username);

    // Generate password reset token
    const resetToken = await user.generatePasswordResetToken();
    console.log('🔑 Reset token generated');

    // Create reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log('🔗 Reset link created:', resetLink.substring(0, 50) + '...');

    // Send email
    try {
      const emailData = passwordResetEmailTemplate(user.username, resetLink);
      console.log('📝 Email template created');
      const emailResult = await sendEmail({ to: user.email, subject: emailData.subject, html: emailData.html });
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('❌ Password reset email failed:', emailErr.message);
      console.error('Full error:', emailErr);
      // Clear the reset token if email fails
      await user.clearPasswordResetToken();
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    return res.status(200).json({
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: { $exists: true, $ne: null },
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Verify the token
    if (!user.verifyPasswordResetToken(token)) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.password = password;
    await user.clearPasswordResetToken();

    // Revoke all refresh tokens (force re-login)
    await user.revokeAllTokens();

    console.log(`✅ Password reset successfully for ${user.email}`);

    return res.status(200).json({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

const googleSignIn = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const client = new OAuth2Client(process.env.CLIENT_ID);

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Create new user from Google data
      // Generate a random username based on email
      let username = email.split('@')[0].toLowerCase();
      
      // Check if username exists, if so add a random number
      let existingUser = await User.findOne({ username: username.toLowerCase().trim() });
      if (existingUser) {
        username = `${username}_${Math.random().toString(36).substr(2, 5)}`;
      }

      // Generate a random password (user won't use it since they signed in with Google)
      const randomPassword = Math.random().toString(36).slice(-8) + 'Aa1!';

      user = await User.create({
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: randomPassword,
        googleId,
      });

      console.log(`✅ New user created via Google: ${email}`);
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const rawRefreshToken = await user.generateRefreshToken(false, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    setRefreshTokenCookie(res, rawRefreshToken, false);

    return res.status(200).json({
      message: 'Google sign-in successful',
      accessToken,
      user: { userId: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    return res.status(401).json({ message: 'Google sign-in failed' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Failed to change password' });
  }
};

export { registerUser, loginUser, refreshAccessToken, logoutUser, logoutAll, checkEmailExists, forgotPassword, resetPassword, googleSignIn, changePassword };