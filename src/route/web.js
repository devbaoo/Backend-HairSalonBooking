import express from "express";
import userController from "../controllers/userController";
import allCodeController from "../controllers/allCodeController";
import stylistController from "../controllers/stylistController";
import serviceController from "../controllers/serviceController";
import customerController from "../controllers/customerController";
import feedbackController from "../controllers/feedbackController";
import staffController from "../controllers/staffController";
import salariesController from "../controllers/salariesController";
import auth from "../middleware/auth";
import multer from "multer";

let router = express.Router();

// Cấu hình multer để lưu trữ file trong bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Web API
let initWebRoutes = (app) => {
  // Authentication API
  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.handleRegister);
  router.post("/api/forgot-password", userController.sendEmailforgotPassword);
  router.put("/api/reset-password/:token", userController.resetPassword);

  // User API
  router.put(
    "/api/edit-user",
    upload.single("imageFile"),
    userController.editUser
  );
  router.delete("/api/delete-user", userController.deleteUser);
  router.get("/api/get-all-user", userController.getAllUsers);
  router.get("/api/get-user-by-id", userController.getUserById);
  router.put(
    "/api/change-user-status",
    auth.authenticateToken,
    userController.changeUserStatus
  );

  //AllCode API
  router.get("/api/get-allcode", allCodeController.getAllCodeService);

  //Stylist API
  router.get("/api/get-all-stylist", stylistController.getAllStylists);
  router.post("/api/save-info-stylists", stylistController.postInfoStylist);
  router.get(
    "/api/get-detail-stylist-by-id",
    stylistController.getDetailStylistById
  );
  router.get(
    "/api/get-schedule-stylist-by-date",
    stylistController.getScheduleByDate
  );
  router.get(
    "/api/get-list-customer-booking-for-stylist",
    stylistController.getListCustomerForStylist
  );

  //Schedule API
  router.post("/api/create-schedule", stylistController.createSchedule);

  //Service API
  router.post(
    "/api/create-service",
    upload.single("imageFile"),
    serviceController.createService
  );
  router.get(
    "/api/get-detail-service-by-id",
    serviceController.getDetailServiceById
  );
  router.put(
    "/api/update-service",
    upload.single("imageFile"),
    serviceController.updateService
  );
  router.delete("/api/delete-service", serviceController.deleteService);
  router.get("/api/get-all-services", serviceController.getAllServices);

  //Customer API
  router.post(
    "/api/customer-book-appointment",
    customerController.createBookAppointment
  );
  router.post(
    "/api/payment-and-verify-book-appointment",
    customerController.paymentAndVerifyBookAppointment
  );
  router.get("/api/get-booking-by-id", customerController.getBookingById);

  //Feedback API
  router.post("/api/create-feedback", feedbackController.createFeedback);
  router.get(
    "/api/get-feedback-by-serviceId",
    feedbackController.getFeedbackByServiceId
  );

  //Staff API
  router.get("/api/get-all-booking", staffController.getAllBooking);

  // Salary API
  router.post("/api/caculate-salary", salariesController.calculateSalary);
  router.get("/api/get-all-salaries", salariesController.getAllSalaries);
  router.get(
    "/api/get-salaries-by-stylistId",
    salariesController.getSalariesByStylistId
  );
  router.put(
    "/api/update-paid-on-salaries",
    salariesController.updatePaidOnSalaries
  );
  router.get(
    "/api/get-salaries-by-month-and-year",
    salariesController.getSalariesByMonthAndYear
  );

  return app.use("/", router);
};

module.exports = initWebRoutes;
