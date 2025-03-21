const nodemailer = require("nodemailer");
require("dotenv").config(); // If using environment variables

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Example: mail.yourdomain.com
  port: process.env.SMTP_PORT, // Use 587 for TLS, 465 for SSL
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.USERNAME,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
