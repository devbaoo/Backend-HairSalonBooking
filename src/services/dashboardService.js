import db from "../models/index";

let totalUser = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await db.User.count({
        where: { status: "Active", roleId: "R4" },
      });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};
let totalServices = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const services = await db.Service.count();
      resolve(services);
    } catch (e) {
      reject(e);
    }
  });
};
let revenue = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const revenue = await db.Payment.sum("paymentAmount", {
        where: { paymentStatus: "Completed" },
      });
      resolve(revenue);
    } catch (e) {
      reject(e);
    }
  });
};
let totalBookings = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const bookings = await db.Booking.count();
      resolve(bookings);
    } catch (e) {
      reject(e);
    }
  });
};
let confirmedBooking = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const pendingOrders = await db.Booking.count({
        where: { statusId: "S2" },
      });
      resolve(pendingOrders);
    } catch (e) {
      reject(e);
    }
  });
};
let completedBooking = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const completedBooking = await db.Booking.count({
        where: { statusId: "S3" },
      });
      resolve(completedBooking);
    } catch (e) {
      reject(e);
    }
  });
};
let canceledBooking = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const canceledBooking = await db.Booking.count({
        where: { statusId: "S4" },
      });
      resolve(canceledBooking);
    } catch (e) {
      reject(e);
    }
  });
};
let totalFeedback = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const feedback = await db.Feedback.count();
      resolve(feedback);
    } catch (e) {
      reject(e);
    }
  });
};
let totalStylist = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await db.User.count({
        where: { status: "Active", roleId: "R3" },
      });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  totalUser,
  totalServices,
  revenue,
  totalBookings,
  completedBooking,
  canceledBooking,
  confirmedBooking,
  totalFeedback,
  totalStylist,
};
