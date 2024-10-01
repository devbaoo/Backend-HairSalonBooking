import db from "../models/index";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import paypalService from "./paypalService";
require("dotenv").config();

let createBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Step 1: createBookAppointment function called with data:', data); // Log input data

      // Validate required parameters
      if (
        !data.email ||
        !data.stylistId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address ||
        !data.amount
      ) {
        console.log('Step 2: Missing required parameters'); // Log missing parameters
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      }

      let token = uuidv4();
      console.log('Step 3: Generated token:', token); // Log generated token

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
      console.log('Step 4: User found or created:', user); // Log user information

      // Check for duplicate booking if user exists
      if (user && user[0]) {
        let existingBooking = await db.Booking.findOne({
          where: {
            stylistId: data.stylistId,
            customerId: user[0].id,
            date: data.date,
            timeType: data.timeType,
          },
        });
        console.log('Step 5: Existing booking check:', existingBooking); // Log existing booking check

        if (existingBooking) {
          console.log('Step 6: Duplicate booking found'); // Log duplicate booking found
          resolve({
            errCode: 2,
            errMsg: "Booking already exists for the selected time and date",
          });
          return;
        }

        // Create new booking if no duplicates found
        let newBooking = await db.Booking.create({
          statusId: "S1",
          stylistId: data.stylistId,
          customerId: user[0].id,
          date: data.date,
          timeType: data.timeType,
          serviceId: data.serviceId,
          token: token,
        });
        console.log('Step 7: New booking created:', newBooking); // Log new booking created

        // Create a payment record with status 'Pending'
        let payment = await db.Payment.create({
          bookingId: newBooking.id,
          paymentAmount: data.amount,
          paymentStatus: "Pending",
          paymentToken: null,
          paymentMethod: "PayPal",
          payerEmail: data.email,
        });
        console.log('Step 8: Payment record created:', payment); // Log payment record created

        // Call PayPal to create payment link
        let paypalApprovalUrl = await paypalService.createBooking(
          Number(data.amount),
          `${process.env.URL_REACT}/payment-success?token=${token}`,
          `${process.env.URL_REACT}/payment-cancel`
        );
        console.log('Step 9: PayPal approval URL generated:', paypalApprovalUrl); // Log PayPal approval URL

        // Send booking email
        await emailService.sendEmailInfoBooking({
          receiverEmail: data.email,
          customerName: data.fullName,
          time: data.timeString,
          stylistName: data.stylistName,
          redirectLink: paypalApprovalUrl,
        });
        console.log('Step 10: Booking email sent to:', data.email); // Log email sent

        resolve({
          errCode: 0,
          errMsg: "Customer booking appointment successfully",
        });
      }
    } catch (e) {
      console.log('Error occurred during booking:', e); // Log any caught errors
      reject(e);
    }
  });
};

let paymentAndVerifyBookAppointment = (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { paymentToken, stylistId, token } = req.body;

      if (!paymentToken || !stylistId || !token) {
        console.log('Missing required parameters:', { paymentToken, stylistId, token });
        resolve({ errCode: 1, errMsg: 'Missing required parameter' });
        return;
      }

      // Find appointment with stylistId and token
      let appointment = await db.Booking.findOne({
        where: {
          stylistId: stylistId,
          token: token,
          statusId: 'S1',
        },
        include: { model: db.Payment },
      });

      if (!appointment) {
        resolve({ errCode: 3, errMsg: 'Appointment not found or already verified' });
        return;
      }

      // Capture payment through PayPal
      let paymentCapture = await paypalService.capturePayment(paymentToken);
      console.log('Payment capture response:', paymentCapture);

      // Update payment record
      let payment = await db.Payment.findOne({ where: { bookingId: appointment.id } });
      if (paymentCapture.status === "COMPLETED") {
        payment.paymentStatus = 'Completed'; // Update payment status
        payment.paymentToken = paymentToken; // Save the payment token for future reference
        console.log('Received payment token:', paymentToken);
      } else {
        payment.paymentStatus = 'Failed'; // Handle failed payment
      }
      await payment.save();
      console.log('Saving payment with status:', payment.paymentStatus);

      // Update appointment status
      appointment.statusId = 'S2'; // Booking confirmed
      await appointment.save();
      console.log('Saving booking with status:', appointment.statusId);

      resolve({ errCode: 0, errMsg: 'Payment successful, appointment verified' });
    } catch (e) {
      console.error('Error during payment verification:', e);
      reject(e);
    }
  });
};


module.exports = {
  createBookAppointment: createBookAppointment,
  paymentAndVerifyBookAppointment: paymentAndVerifyBookAppointment,
};
