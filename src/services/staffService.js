import db from "../models/index";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
import { sendEmailCancelBooking } from "../../src/services/emailService";
require("dotenv").config();

let getAllBooking = (date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!date) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      } else {
        let data = await db.Booking.findAll({
          where: {
            date: date,
          },
          include: [
            {
              model: db.User,
              as: "customerData",
              attributes: ["email", "firstName", "address"],
            },
            {
              model: db.User,
              as: "stylistDataBooking",
              attributes: ["email", "firstName", "address"],
            },
            {
              model: db.Service,
              as: "services",
              attributes: ["name"],
              through: {
                attributes: [], // Exclude attributes from the through table
              },
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

let cancelBookingForStaff = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.bookingId) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      }

      // Tìm booking với id và statusId = "S1" hoặc "S2"
      let booking = await db.Booking.findOne({
        where: {
          id: data.bookingId,
          statusId: {
            [db.Sequelize.Op.or]: ["S1", "S2"], // Tìm với statusId là S1 hoặc S2
          },
        },
        include: [
          {
            model: db.User,
            as: "customerData",
            attributes: ["email", "firstName"],
          },
          {
            model: db.User,
            as: "stylistDataBooking",
            attributes: ["firstName"],
          },
        ],
        raw: true,
        nest: true,
      });

      // Nếu tìm thấy booking
      if (booking) {
        let dataSend = {
          receiverEmail: data.email, // Lấy email từ dữ liệu booking tìm được
          customerName: data.firstName,
          stylistName: data.firstName,
          time: data.timeString, // giữ nguyên giá trị từ data truyền vào
          contactLink: "https://yourwebsite.com/contact",
        };

        // Gửi email thông báo hủy
        await emailService.sendEmailCancelBooking(dataSend);

        // Cập nhật trạng thái của booking và thanh toán
        await db.Booking.update(
          { statusId: "S4" }, // Chuyển statusId thành S4
          { where: { id: data.bookingId } }
        );

        await db.Payment.update(
          { paymentStatus: "Failed" }, // Cập nhật paymentStatus thành Failed
          { where: { bookingId: data.bookingId, paymentStatus: "Completed" } }
        );

        resolve({
          errCode: 0,
          errMsg: "Booking canceled successfully, email sent",
        });
      } else {
        resolve({
          errCode: 3,
          errMsg: "Booking not found",
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
  getAllBooking: getAllBooking,
  cancelBookingForStaff: cancelBookingForStaff,
};
