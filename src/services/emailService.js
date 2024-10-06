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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <h1 style="color: #333;">Hello ${dataSend.receiverName}!</h1>
      <p style="color: #555;">You requested a password reset for your <strong>HairCare</strong> account.</p>
      <p style="color: #555;">Click the link below to reset your password:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; color: #fff; background-color: #007BFF; border-radius: 5px; text-decoration: none;">Reset Password</a>
      <p style="color: #555;">If you did not request this, please ignore this email.</p>
      <p style="color: #555;">Thank you,</p>
      <p style="color: #555;"><strong>The HairCare Team</strong></p>
      <img src="https://firebasestorage.googleapis.com/v0/b/haircare-84cb9.appspot.com/o/tai_xuong_2.jpg?alt=media&token=beb77f04-d890-4ed5-a294-a87952e4a2f2" alt="HairCare Logo" style="max-width: 100%; height: auto;"/>
    </div>
  `;
};

let sendEmailInfoBooking = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"HairCare" <HairCare@company.com>', // sender address
    to: dataSend.receiverEmail, // list of receivers
    subject: "Confirm Haircut Appointment At Barber Shop", // Subject line
    html: getBodyHTMLEmailInfoBooking(dataSend),
  });
};

let getBodyHTMLEmailInfoBooking = (dataSend) => {
  return `
  <h3>Dear ${dataSend.customerName},</h3>
  <p>Thank you for booking an appointment at Barber Shop! Please review the details of your booking below:</p>

  <div><strong>Appointment Time:</strong> ${dataSend.time}</div>
  <div><strong>Hairdresser:</strong> ${dataSend.stylistName}</div>

  <p>If everything looks correct, please click the link below to confirm your appointment and proceed with the payment:</p>
  <div style="margin: 20px 0;">
    <a href="${dataSend.redirectLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm & Pay</a>
  </div>

  <p>If you need to make any changes or have questions, feel free to reply to this email for assistance.</p>

  <div>We appreciate your choice of Barber Shop and look forward to seeing you soon!</div>
  <div>Best regards,<br>Barber Shop Team</div>
`;

};

module.exports = {
  sendForgotPasswordEmail,
  sendEmailInfoBooking,
};
