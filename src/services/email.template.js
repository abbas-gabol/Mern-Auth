
export const welcomeEmailTemplate = (username) => ({
  subject: "Welcome to Our Service 🎉",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Welcome, ${username}! 👋</h2>
      <p>Thank you for registering with us. We're thrilled to have you on board.</p>
    </div>
  `,
});