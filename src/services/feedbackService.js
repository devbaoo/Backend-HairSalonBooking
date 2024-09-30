import db from "../models/index";

let createFeedback = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.userId ||
        !data.bookingId ||
        !data.comment ||
        !data.rating ||
        !data.serviceId
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      }
      let { userId, bookingId, comment, rating } = data;
      let service = await db.Service.findByPk(data.ServiceID);
      if (!service) {
        resolve({
          errCode: 2,
          success: false,
          errMessage: "Service not found",
        });
      }
      let booking = await db.Booking.findByPk(bookingId);
      if (!booking) {
        resolve({
          errCode: 3,
          success: false,
          errMessage: "Booking not found",
        });
      }
      let user = await db.User.findByPk(userId);
      if (!user) {
        resolve({
          errCode: 4,
          success: false,
          errMessage: "User not found",
        });
      }
      let feedback = await db.Feedback.create({
        userId,
        bookingId,
        serviceId,
        comment,
        rating,
      });
      resolve({
        errCode: 0,
        success: true,
        message: "Feedback created successfully",
      });
      resolve(feedback);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createFeedback,
};
