
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("SMTP email server connected successfully.");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error.message);
    return false;
  }
}

async function sendPasswordResetEmail(email, resetUrl) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Password Reset - Simulator Workshop",

      text: `You requested a password reset.

Open this link to create a new password:
${resetUrl}

This link expires in 15 minutes and can only be used once.

If you did not request this, ignore this email.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px;">
          <h2>Password Reset</h2>
          <p>You requested a password reset for your Simulator Workshop account.</p>
          <p>
            <a href="${resetUrl}"
              style="background:#008348;color:white;padding:12px 20px;
              text-decoration:none;border-radius:6px;">
              Reset Password
            </a>
          </p>
          <p>This link expires in 15 minutes and can only be used once.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    console.log("Password reset email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
  verifyEmailConnection,
};

