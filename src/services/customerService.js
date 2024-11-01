import db from "../models/index";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import paypalService from "./paypalService";
import { Op } from "sequelize";
require("dotenv").config();

let createBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();
    try {
      if (
        !data.email ||
        !data.stylistId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.amount ||
        !data.serviceIds
      ) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      }

      let token = uuidv4();

      // Kiểm tra xem slot thời gian có khả dụng hay không trong transaction
      let availableSlot = await db.Schedule.findOne({
        where: {
          stylistId: data.stylistId,
          date: data.date,
          timeType: data.timeType,
          statusTime: "enable",
        },
        lock: transaction.LOCK.UPDATE, // Khóa để ngăn truy cập đồng thời
        transaction, // Sử dụng transaction
      });

      if (!availableSlot) {
        await transaction.rollback(); // Hủy giao dịch nếu slot không khả dụng
        resolve({
          errCode: 2,
          errMsg: "The selected time slot is already booked",
        });
        return;
      }

      let user = await db.User.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          roleId: "R4",
          firstName: data.fullName,
        },
        transaction, // Bao gồm trong transaction
      });

      let discount = 0;
      if (data.usePoints && data.pointsToUse > 0) {
        const pointsToUse = Math.min(user[0].points, data.pointsToUse);
        const discountPercentage = Math.floor(pointsToUse / 10) * 0.1;
        discount = data.amount * discountPercentage;

        await db.User.update(
          { points: user[0].points - pointsToUse },
          { where: { id: user[0].id }, transaction }
        );
      }

      // Tạo booking mới trong transaction
      let newBooking = await db.Booking.create(
        {
          statusId: "S1",
          stylistId: data.stylistId,
          customerId: user[0].id,
          date: data.date,
          timeType: data.timeType,
          token: token,
        },
        { transaction }
      );

      // Cập nhật statusTime trong bảng Schedule
      await db.Schedule.update(
        { statusTime: "disable" },
        {
          where: {
            stylistId: data.stylistId,
            date: data.date,
            timeType: data.timeType,
          },
          transaction,
        }
      );

      if (Array.isArray(data.serviceIds) && data.serviceIds.length > 0) {
        const bookingServices = data.serviceIds.map((serviceId) => ({
          bookingId: newBooking.id,
          serviceId: serviceId,
        }));
        await db.BookingService.bulkCreate(bookingServices, { transaction });
      }

      // Xử lý thanh toán và email sau khi tạo booking thành công
      await transaction.commit(); // Cam kết giao dịch trước khi xử lý thanh toán và email

      let totalAmountAfterDiscount = data.amount - discount;
      if (totalAmountAfterDiscount < 0) totalAmountAfterDiscount = 0;

      let paypalResponse = await paypalService.createBooking(
        totalAmountAfterDiscount.toFixed(2),
        `${process.env.URL_REACT}/payment/success?token=${token}&stylistId=${data.stylistId}`,
        `${process.env.URL_REACT}/payment/cancel?token=${token}`
      );

      let paymentId = paypalResponse.id;
      let approvalLink = paypalResponse.links.find(
        (link) => link.rel === "approval_url"
      ).href;

      await db.Payment.create({
        bookingId: newBooking.id,
        paymentAmount: totalAmountAfterDiscount,
        paymentStatus: "Pending",
        paymentId: paymentId,
        paymentMethod: "PayPal",
        payerEmail: data.email,
      });

      await emailService.sendEmailInfoBooking({
        receiverEmail: data.email,
        customerName: data.fullName,
        time: data.timeString,
        stylistName: data.stylistName,
        amount: totalAmountAfterDiscount,
        redirectLink: approvalLink,
      });

      resolve({
        errCode: 0,
        errMsg: "Customer booking appointment successfully",
        paymentId: paymentId,
      });
    } catch (e) {
      if (transaction) await transaction.rollback(); // Hủy giao dịch nếu có lỗi
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
          errMsg: "Missing required parameters",
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
        raw: false,
        nest: true,
      });

      if (!appointment) {
        resolve({
          errCode: 3,
          errMsg: "Appointment not found or already verified",
        });
        return;
      }

      // Use the Payment ID (stored in paymentId) to capture the payment
      let paymentCapture = await paypalService.capturePayment(
        paymentId,
        payerId
      );

      if (paymentCapture && paymentCapture.state === "approved") {
        await db.Payment.update(
          {
            paymentStatus: "Completed",
            paymentId: paymentId,
            payerId: payerId,
          },
          {
            where: { id: appointment.payment.id },
          }
        );

        await db.Booking.update(
          { statusId: "S2" },
          {
            where: { id: appointment.id },
          }
        );

        resolve({
          errCode: 0,
          errMsg: "Payment successful, appointment verified",
        });
      } else {
        await db.Payment.update(
          { paymentStatus: "Failed" },
          {
            where: { id: appointment.payment.id },
          }
        );
        resolve({
          errCode: 4,
          errMsg: "Payment failed",
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
            customerId: customerId,
          },
          include: [
            {
              model: db.User,
              as: "customerData",
              attributes: ["email", "firstName", "lastName", "address", "gender"],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.User,
              as: "stylistDataBooking",
              attributes: ["email", "firstName", "lastName", "address", "gender"],
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
            {
              model: db.Service,
              as: "services",
              attributes: ["id", "name"], // Include Service ID and name
              through: {
                attributes: [], // Exclude attributes from the through table
              },
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
      let booking = await db.Booking.findOne({
        where: {
          id: bookingId,
          statusId: "S1",
        },
      });
      if (booking) {
        await db.Booking.update(
          { statusId: "S4" },
          { where: { id: bookingId } }
        );

        await db.Schedule.update(
          { statusTime: "enable" },
          {
            where: {
              stylistId: booking.stylistId,
              date: booking.date,
              timeType: booking.timeType
            }
          }
        );

        await db.Payment.update(
          { paymentStatus: "Failed" },
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
