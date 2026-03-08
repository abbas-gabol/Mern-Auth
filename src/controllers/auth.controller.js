import { User } from '../model/user.model.js';
import { sendEmail } from '../services/email.service.js';
import { welcomeEmailTemplate } from '../services/email.template.js';
import { z } from 'zod';



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
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
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

export { registerUser, loginUser, refreshAccessToken, logoutUser, logoutAll };