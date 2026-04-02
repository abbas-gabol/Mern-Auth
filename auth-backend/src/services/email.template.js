
export const welcomeEmailTemplate = (username) => ({
  subject: "Welcome to AuthCore! 🎉 Verify Your Email",
  html: `
    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafaf8; border-radius: 12px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 50px; height: 50px; background: #111; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 20px; height: 20px; background: white; border-radius: 4px; opacity: 0.9;"></div>
        </div>
        <h1 style="color: #0f0f0f; margin: 0; font-size: 24px; font-weight: 700;">Welcome to AuthCore!</h1>
      </div>

      <!-- Main Content -->
      <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <p style="color: #333; margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
          Hi <strong>${username}</strong>,
        </p>
        
        <p style="color: #666; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
          Thank you for signing up for <strong>AuthCore</strong>! We're excited to have you join our community. Your account has been successfully created and is ready to use.
        </p>

        <!-- Action Items -->
        <div style="background: #f9f9f8; border-left: 4px solid #34d399; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="color: #0f0f0f; margin: 0 0 12px; font-size: 14px; font-weight: 600;">What's Next?</h3>
          <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
            <li>Log in to your account with your credentials</li>
            <li>Complete your profile (coming soon)</li>
            <li>Start exploring all features we have to offer</li>
          </ul>
        </div>

        <!-- Login Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="http://localhost:5173" style="display: inline-block; background: #111; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.2s;">
            Go to Login
          </a>
        </div>

        <!-- Account Info -->
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #999; margin: 0; font-size: 12px; line-height: 1.6;">
            <strong>Account Details:</strong><br>
            Username: <code style="background: #eee; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${username}</code><br>
            Email: Verified
          </p>
        </div>

        <!-- Security Note -->
        <p style="color: #999; margin: 0 0 16px; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 16px;">
          <strong>🔒 Security Tip:</strong> Never share your password with anyone. We'll never ask for your password via email.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e8e8e8;">
        <p style="color: #999; margin: 0 0 8px; font-size: 12px;">
          AuthCore Team
        </p>
        <p style="color: #ccc; margin: 0; font-size: 11px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    </div>
  `,
});

export const passwordResetEmailTemplate = (username, resetLink) => ({
  subject: "Reset Your AuthCore Password 🔐",
  html: `
    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafaf8; border-radius: 12px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 50px; height: 50px; background: #111; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 20px; height: 20px; background: white; border-radius: 4px; opacity: 0.9;"></div>
        </div>
        <h1 style="color: #0f0f0f; margin: 0; font-size: 24px; font-weight: 700;">Password Reset Request</h1>
      </div>

      <!-- Main Content -->
      <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <p style="color: #333; margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
          Hi <strong>${username}</strong>,
        </p>
        
        <p style="color: #666; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
        </p>

        <!-- Warning -->
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;">
            <strong>⏰ This link expires in 1 hour</strong><br>
            If you don't use this link within 1 hour, you'll need to request a new password reset.
          </p>
        </div>

        <!-- Reset Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetLink}" style="display: inline-block; background: #111; color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px; transition: all 0.2s;">
            Reset Your Password
          </a>
        </div>

        <!-- Link as text -->
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 20px; word-break: break-all;">
          <p style="color: #999; margin: 0 0 8px; font-size: 11px;">Or copy this link:</p>
          <p style="color: #666; margin: 0; font-size: 12px; font-family: monospace;">
            ${resetLink}
          </p>
        </div>

        <!-- Security Note -->
        <p style="color: #999; margin: 0 0 16px; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 16px;">
          <strong>🔒 Never share this link</strong><br>
          Don't forward this email or share the reset link with anyone. We'll never ask you to confirm your password via email.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e8e8e8;">
        <p style="color: #999; margin: 0 0 8px; font-size: 12px;">
          AuthCore Team
        </p>
        <p style="color: #ccc; margin: 0; font-size: 11px;">
          If you didn't request a password reset, please secure your account immediately by logging in and changing your password.
        </p>
      </div>
    </div>
  `,
});