const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for SSL (465), false for TLS (587)
  auth: {
    user: process.env.USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify SMTP Connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server Ready");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.USERNAME}>`, // Improve formatting
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
