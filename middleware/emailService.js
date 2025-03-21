const nodemailer = require("nodemailer");
import "dotenv/config";


// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
   port: 587,
  secure: false, // true for SSL (465), false for TLS (587)
  auth: {
    user: process.env.SMTP_USERNAME,
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
const sendEmail = async (email,subject,message) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.SMTP_USERNAME}>`, // Improve formatting
      to:"kevjames940@gmail.com",
      subject,
      text:`New Message \n\nSubject: ${subject}\nFrom: ${email}\nMessage:${message}`,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
