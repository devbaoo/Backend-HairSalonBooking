const db = require("../models"); // Ensure the models are correctly imported

let createFeedback = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.customerId ||
        !data.bookingId ||
        !data.comment ||
        !data.rating ||
        !data.serviceId
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      }

      let { customerId, bookingId, comment, rating, serviceId } = data;

      let user = await db.Booking.findOne({ where: { customerId } });
      if (!user) {
        return resolve({
          errCode: 4,
          success: false,
          errMessage: "User not found",
        });
      }

      let service = await db.BookingService.findOne({ where: { serviceId } });
      if (!service) {
        return resolve({
          errCode: 2,
          success: false,
          errMessage: "Service not found",
        });
      }

      let booking = await db.BookingService.findOne({ where: { bookingId } });
      if (!booking) {
        return resolve({
          errCode: 3,
          success: false,
          errMessage: "Booking not found",
        });
      }

      let feedback = await db.Feedback.create({
        userId: customerId,
        bookingId,
        serviceId,
        comment,
        rating,
      });

      resolve({
        errCode: 0,
        success: true,
        message: "Feedback created successfully",
        feedback,
      });
    } catch (error) {
      console.error("Error: ", error);
      reject({
        errCode: -1,
        errMsg: "An error occurred on the server",
        details: error.message,
      });
    }
  });
};
let getFeedbackByServiceId = async (serviceId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!serviceId) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      }

      let feedback = await db.Feedback.findAll({
        where: { serviceId },
        include: [{ model: db.User, attributes: ["firstName", "lastName"] }],
        raw: true,
        nest: true, // Sử dụng nest để tổ chức dữ liệu dễ dàng
      });

      // Định dạng dữ liệu đầu ra theo yêu cầu
      feedback = feedback.map((item) => ({
        ...item,
        firstName: item.User.firstName,
        lastName: item.User.lastName,
      }));

      // Loại bỏ thuộc tính `User` không cần thiết
      feedback.forEach((item) => delete item.User);

      if (!feedback || feedback.length === 0) {
        return resolve({
          errCode: 2,
          errMessage: "No feedback found for the given service",
        });
      }

      resolve({
        errCode: 0,
        success: true,
        message: "Feedbacks retrieved successfully",
        feedback,
      });
    } catch (error) {
      console.error("Error fetching feedback: ", error);
      reject({
        errCode: -1,
        errMsg: "An error occurred on the server",
        details: error.message,
      });
    }
  });
};

module.exports = {
  createFeedback,
  getFeedbackByServiceId,
};
