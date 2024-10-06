import db from "../models/index";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import paypalService from "./paypalService";
require("dotenv").config();

let createBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate required parameters
      if (!data.email || !data.stylistId || !data.timeType || !data.date ||
        !data.fullName || !data.selectedGender || !data.address || !data.amount || !data.serviceIds) {
        resolve({ errCode: 1, errMsg: "Missing required parameter" });
        return;
      }

      let token = uuidv4();
      // Find or create user
      let user = await db.User.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          roleId: "R4",
          firstName: data.fullName,
          address: data.address,
          gender: data.selectedGender,
        },
      });

      // Check for duplicate booking
      if (user && user[0]) {
        let existingBooking = await db.Booking.findOne({
          where: {
            stylistId: data.stylistId,
            customerId: user[0].id,
            date: data.date,
            timeType: data.timeType,
          },
        });
        if (existingBooking) {
          resolve({ errCode: 2, errMsg: "Booking already exists for the selected time and date" });
          return;
        }

        // Create new booking
        let newBooking = await db.Booking.create({
          statusId: "S1",
          stylistId: data.stylistId,
          customerId: user[0].id,
          date: data.date,
          timeType: data.timeType,
          token: token,
        });

        // Convert serviceIds to an array if it is a string
        if (typeof data.serviceIds === 'string') {
          try {
            data.serviceIds = JSON.parse(data.serviceIds);
          } catch (e) {
            console.log('Failed to parse serviceIds:', e);
            resolve({ errCode: 1, errMsg: "Invalid serviceIds format" });
            return;
          }
        }

        // Add multiple services to the booking
        if (Array.isArray(data.serviceIds) && data.serviceIds.length > 0) {
          const bookingServices = data.serviceIds.map(serviceId => ({
            bookingId: newBooking.id,
            serviceId: serviceId
          }));
          await db.BookingService.bulkCreate(bookingServices);
        } else {
          console.log('No services selected for booking or serviceIds is not an array.');
        }

        // Create a payment record with status 'Pending'
        let payment = await db.Payment.create({
          bookingId: newBooking.id,
          paymentAmount: data.amount,
          paymentStatus: "Pending",
          paymentToken: null,
          paymentMethod: "PayPal",
          payerEmail: data.email,
        });

        // Call PayPal to create payment link
        let paypalApprovalUrl = await paypalService.createBooking(
          Number(data.amount),
          `${process.env.URL_BACKEND}/api/payment/success?token=${token}`,
          `${process.env.URL_REACT}/payment-cancel`
        );

        // Send booking email
        await emailService.sendEmailInfoBooking({
          receiverEmail: data.email,
          customerName: data.fullName,
          time: data.timeString,
          stylistName: data.stylistName,
          redirectLink: paypalApprovalUrl,
        });

        resolve({ errCode: 0, errMsg: "Customer booking appointment successfully" });
      }
    } catch (e) {
      console.log('Error occurred during booking:', e);
      reject(e);
    }
  });
};

let paymentAndVerifyBookAppointment = async (req, res) => {
  try {
    const { paymentToken, stylistId, token } = req.body;

    if (!paymentToken || !stylistId || !token) {
      return res.status(400).json({ errCode: 1, errMsg: "Missing required parameters" });
    }

    // Find the booking
    let appointment = await db.Booking.findOne({
      where: {
        stylistId: stylistId,
        token: token,
        statusId: "S1",
      },
      include: { model: db.Payment },
    });

    if (!appointment) {
      return res.status(404).json({ errCode: 3, errMsg: "Appointment not found or already verified" });
    }

    // Capture payment
    let paymentCapture = await paypalService.capturePayment(paymentToken);
    console.log("PayPal Capture Response:", paymentCapture);  // Log PayPal response

    // Check if PayPal responded with "COMPLETED" status
    let payment = await db.Payment.findOne({ where: { bookingId: appointment.id } });
    if (paymentCapture.status === "COMPLETED") {
      payment.paymentStatus = "Completed";
      payment.paymentToken = paymentToken;
      await payment.save();

      // Update the booking status
      appointment.statusId = "S2";
      await appointment.save();

      return res.status(200).json({ errCode: 0, errMsg: "Payment successful, appointment verified" });
    } else {
      console.log("PayPal Payment failed:", paymentCapture); // Log failure reason
      payment.paymentStatus = "Failed";
      await payment.save();
      return res.status(400).json({ errCode: 4, errMsg: "Payment failed" });
    }
  } catch (error) {
    console.error("Error during payment verification:", error);
    return res.status(500).json({ errCode: 5, errMsg: "Internal server error" });
  }
};

module.exports = {
  createBookAppointment,
  paymentAndVerifyBookAppointment,
};
