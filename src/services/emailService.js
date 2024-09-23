require("dotenv").config();
const nodemailer = require("nodemailer");

let sendForgotPasswordEmail = async (email, firstName, token) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP, // your Gmail account
      pass: process.env.EMAIL_APP_PASSWORD, // your Gmail password or App password
    },
  });

  // Prepare the data to send
  let dataSend = {
    email: email,
    receiverName: firstName, // Use the firstName parameter
    token: token,
  };

  // Define the email body before sending
  let htmlBody = getBodyHTMLEmail(dataSend);

  // Send the email
  let info = await transporter.sendMail({
    from: '"HairCare" <HairCare@company.com>', // sender address
    to: dataSend.email, // recipient's email
    subject: "Reset Password Instructions", // subject line
    html: htmlBody, // HTML body content
  });

  console.log("Message sent: %s", info.messageId);
};

// Helper function to generate the email body
let getBodyHTMLEmail = (dataSend) => {
  let url = `${process.env.URL_REACT}/reset-password/${dataSend.token}`;
  return `
      <h1>Hello ${dataSend.receiverName}!</h1>
      <p>You requested a password reset for your HairCare account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you,</p>
      <p>The HairCare Team</p>
  `;
};

module.exports = {
  sendForgotPasswordEmail,
};
