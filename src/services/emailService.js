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
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 40px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px;">
      <h2 style="color: #2c3e50; text-align: center;">Booking Confirmation</h2>

      <p style="font-size: 16px; color: #555;">Hello <strong>${dataSend.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #555;">Thank you for choosing <strong>Barber Shop</strong>! We're excited to confirm your appointment.</p>

      <table style="width: 100%; margin: 20px 0; border-spacing: 0;">
        <tr style="background-color: #f0f0f0;">
          <td style="padding: 12px; font-weight: bold; color: #333;">Appointment Time</td>
          <td style="padding: 12px; color: #555;">${dataSend.time}</td>
        </tr>
        <tr style="background-color: #fafafa;">
          <td style="padding: 12px; font-weight: bold; color: #333;">Hairdresser</td>
          <td style="padding: 12px; color: #555;">${dataSend.stylistName}</td>
        </tr>
        <tr style="background-color: #f0f0f0;">
          <td style="padding: 12px; font-weight: bold; color: #333;">Amount</td>
          <td style="padding: 12px; color: #555;">${dataSend.amount}</td>
        </tr>
      </table>

      <p style="font-size: 16px; color: #555;">Please review the details above and confirm your booking by clicking the button below:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${dataSend.redirectLink}" target="_blank" style="background-color: #3498db; color: white; padding: 14px 28px; text-decoration: none; font-size: 16px; border-radius: 8px;">Confirm & Pay</a>
      </div>

      <p style="font-size: 16px; color: #555;">If you have any questions or need to make changes, feel free to reply to this email, and we’ll be happy to assist.</p>

      <div style="margin-top: 40px; text-align: center;">
        <p style="font-size: 14px; color: #aaa;">Thank you for choosing Barber Shop. We look forward to serving you!</p>
        <p style="font-size: 14px; color: #aaa;">Best regards, <br><strong>The Barber Shop Team</strong></p>
      </div>
    </div>
  </div>
  `;
};

let sendEmailCancelBooking = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"HairCare" <HairCare@company.com>', // sender address
    to: dataSend.receiverEmail, // recipient
    subject: "Your Haircut Appointment Has Been Canceled", // Subject line
    html: getBodyHTMLEmailCancelBooking(dataSend),
  });
};

let getBodyHTMLEmailCancelBooking = (dataSend) => {
  return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 40px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px;">
      <h2 style="color: #e74c3c; text-align: center;">Booking Cancellation</h2>

      <p style="font-size: 16px; color: #555;">Hello <strong>${dataSend.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #555;">We're sorry to inform you that your appointment with <strong>${dataSend.stylistName}</strong> on <strong>${dataSend.time}</strong> has been canceled.</p>

      <p style="font-size: 16px; color: #555;">If you have any questions or wish to reschedule, please feel free to contact us.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${dataSend.contactLink}" target="_blank" style="background-color: #e74c3c; color: white; padding: 14px 28px; text-decoration: none; font-size: 16px; border-radius: 8px;">Contact Us</a>
      </div>

      <p style="font-size: 16px; color: #555;">We hope to have the chance to serve you in the future.</p>

      <div style="margin-top: 40px; text-align: center;">
        <p style="font-size: 14px; color: #aaa;">Thank you for understanding, and we apologize for any inconvenience.</p>
        <p style="font-size: 14px; color: #aaa;">Best regards, <br><strong>The Barber Shop Team</strong></p>
      </div>
    </div>
  </div>
  `;
};

let sendEmailCompleteService = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"HairCare" <HairCare@company.com>', // sender address
    to: dataSend.receiverEmail, // recipient
    subject: "Thank You for Using Our Service!", // Subject line
    html: getBodyHTMLEmailCompleteService(dataSend),
  });
};
let getBodyHTMLEmailCompleteService = (dataSend) => {
  return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 40px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px;">
      <h2 style="color: #2ecc71; text-align: center;">Thank You for Choosing Us!</h2>

      <p style="font-size: 16px; color: #555;">Hello <strong>${dataSend.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #555;">Thank you for trusting our service. We hope you had a great experience with stylist <strong>${dataSend.stylistName}</strong> on <strong>${dataSend.serviceDate}</strong> at <strong>${dataSend.serviceTime}</strong>.</p>

      <p style="font-size: 16px; color: #555;">We are always looking to improve our services, and we'd love to hear your feedback. Please take a moment to share your experience with us:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${dataSend.feedbackLink}" target="_blank" style="background-color: #2ecc71; color: white; padding: 14px 28px; text-decoration: none; font-size: 16px; border-radius: 8px;">Give Feedback</a>
      </div>

      <p style="font-size: 16px; color: #555;">Once again, thank you for choosing our service. We look forward to serving you again!</p>

      <div style="margin-top: 40px; text-align: center;">
        <p style="font-size: 14px; color: #aaa;">Best regards, <br><strong>The HairCare Team</strong></p>
      </div>
    </div>
  </div>
  `;
};




module.exports = {
  sendForgotPasswordEmail,
  sendEmailInfoBooking,
  sendEmailCancelBooking,
  sendEmailCompleteService
};
