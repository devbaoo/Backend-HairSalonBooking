import db from "../models/index";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import paypalService from "./paypalService";
require("dotenv").config();

let createBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.stylistId || !data.timeType || !data.date ||
        !data.fullName || !data.amount || !data.serviceIds) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter"
        });
        return;
      }

      let token = uuidv4();

      let user = await db.User.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          roleId: "R4",
          firstName: data.fullName,
        },
      });

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
          resolve({
            errCode: 2,
            errMsg: "Booking already exists for the selected time and date"
          });
          return;
        }

        let newBooking = await db.Booking.create({
          statusId: "S1",
          stylistId: data.stylistId,
          customerId: user[0].id,
          date: data.date,
          timeType: data.timeType,
          token: token,
        });

        if (typeof data.serviceIds === "string") {
          try {
            data.serviceIds = JSON.parse(data.serviceIds);
          } catch (e) {
            resolve({
              errCode: 1,
              errMsg: "Invalid serviceIds format"
            });
            return;
          }
        }

        if (Array.isArray(data.serviceIds) && data.serviceIds.length > 0) {
          const bookingServices = data.serviceIds.map(serviceId => ({
            bookingId: newBooking.id,
            serviceId: serviceId,
          }));
          await db.BookingService.bulkCreate(bookingServices);
        }

        // Call PayPal to create an order
        let paypalResponse = await paypalService.createBooking(
          Number(data.amount),
          `${process.env.URL_BACKEND}/payment/success?token=${token}&stylistId=${data.stylistId}`,
          `${process.env.URL_BACKEND}/payment/cancel?token=${token}`
        );
        console.log("PayPal response:", paypalResponse);

        // Extract the Payment ID and approval URL
        let paymentId = paypalResponse.id;  // Extract the Payment ID (PAYID-...)
        let approvalLink = paypalResponse.links.find(link => link.rel === "approval_url").href;

        // Save the Payment ID (PAYID-...) in the paymentId column
        let payment = await db.Payment.create({
          bookingId: newBooking.id,
          paymentAmount: data.amount,
          paymentStatus: "Pending",
          paymentId: paymentId,  // Save the correct Payment ID here
          paymentMethod: "PayPal",
          payerEmail: data.email,
        });

        // Send booking confirmation email with PayPal payment URL
        await emailService.sendEmailInfoBooking({
          receiverEmail: data.email,
          customerName: data.fullName,
          time: data.timeString,
          stylistName: data.stylistName,
          redirectLink: approvalLink,  // PayPal payment URL for the customer to approve the payment
        });

        resolve({
          errCode: 0,
          errMsg: "Customer booking appointment successfully",
          paymentId: paymentId // Return paymentId for frontend usage
        });
      }
    } catch (e) {
      console.log("Error during booking:", e);
      reject(e);
    }
  });
};

let paymentAndVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { paymentId, stylistId, token, payerId } = data;

      if (!paymentId || !stylistId || !token || !payerId) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameters"
        });
        return;
      }

      let appointment = await db.Booking.findOne({
        where: {
          stylistId: stylistId,
          token: token,
          statusId: "S1",
        },
        include: [{ model: db.Payment, as: "payment" }],
        raw: true,
        nest: true
      });

      if (!appointment) {
        resolve({
          errCode: 3,
          errMsg: "Appointment not found or already verified"
        });
        return;
      }

      // Use the Payment ID (stored in paymentId) to capture the payment
      let paymentCapture = await paypalService.capturePayment(appointment.payment.paymentId, payerId); // Use Payment ID here

      if (paymentCapture && paymentCapture.state === "approved") {
        await db.Payment.update(
          {
            paymentStatus: "Completed",
            paymentId: appointment.payment.paymentId, // Ensure Payment ID is used here
            payerId: payerId // Save the payerId here
          },
          {
            where: { id: appointment.payment.id }
          }
        );

        await db.Booking.update(
          { statusId: "S2" },
          {
            where: { id: appointment.id }
          }
        );

        resolve({
          errCode: 0,
          errMsg: "Payment successful, appointment verified"
        });
      } else {
        await db.Payment.update(
          { paymentStatus: "Failed" },
          {
            where: { id: appointment.payment.id }
          }
        );
        resolve({
          errCode: 4,
          errMsg: "Payment failed"
        });
      }
    } catch (e) {
      console.log("Error during payment verification:", e);
      reject(e);
    }
  });
};

let getBookingById = (customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!customerId) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: "S1",
            customerId: customerId,
          },
          include: [
            {
              model: db.User,
              as: "customerData",
              attributes: ["email", "firstName", "address", "gender"],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataBooking",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let cancelBookingForCustomer = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bookingId) {
        reject({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      }

      // Tìm booking với id và statusId = "S1"
      let booking = await db.Booking.findOne({
        where: {
          id: bookingId,
          statusId: "S1",
        },
      });

      // Kiểm tra nếu booking tồn tại
      if (booking) {
        // Cập nhật statusId của booking và paymentStatus của bảng Payment
        await db.Booking.update(
          { statusId: "S4" }, // chuyển từ S1 sang S4
          { where: { id: bookingId } }
        );

        await db.Payment.update(
          { paymentStatus: "Failed" }, // chuyển paymentStatus từ Pending sang Failed
          { where: { bookingId: bookingId, paymentStatus: "Pending" } }
        );

        resolve({
          errCode: 0,
          errMsg: "Booking canceled successfully",
        });
      } else {
        reject({
          errCode: 2,
          errMsg: "Booking not found or not in valid status",
        });
      }
    } catch (e) {
      reject({
        errCode: 3,
        errMsg: "An error occurred",
        error: e,
      });
    }
  });
};


module.exports = {
  createBookAppointment,
  paymentAndVerifyBookAppointment,
  getBookingById,
  cancelBookingForCustomer,
};