import express from "express";
import userController from "../controllers/userController";
import allCodeController from "../controllers/allCodeController";
import stylistController from "../controllers/stylistController";
import serviceController from "../controllers/serviceController";

let router = express.Router();

let initWebRoutes = (app) => {
  // Authentication API
  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.handleRegister);
  router.post("/api/forgot-password", userController.sendEmailforgotPassword);
  router.put("/api/reset-password/:token", userController.resetPassword);

  // User API
  router.put("/api/edit-user", userController.editUser);
  router.delete("/api/delete-user", userController.deleteUser);
  router.get("/api/get-all-user", userController.getAllUsers);

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

  //Schedule API
  router.post("/api/create-schedule", stylistController.createSchedule);

  //Service API
  router.post("/api/create-service", serviceController.createService);
  router.get(
    "/api/get-detail-service-by-id",
    serviceController.getDetailServiceById
  );
  router.put("/api/update-service", serviceController.updateService);
  router.delete("/api/delete-service", serviceController.deleteService);
  router.get("/api/get-all-services", serviceController.getAllServices);

  return app.use("/", router);
};

module.exports = initWebRoutes;
