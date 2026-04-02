import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); 

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Brevo SMTP connection failed:", error.message);
  } else {
    console.log("Brevo SMTP is ready ✅");
  }
});
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await transporter.sendMail({
      from: `"Authcore" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Email send error:", error.message);
    throw error;
  }
};