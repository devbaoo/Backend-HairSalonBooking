import express from "express";
import userController from "../controllers/userController";
import allCodeController from "../controllers/allCodeController";

let router = express.Router();

let initWebRoutes = (app) => {
  // Authentication API
  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.handleRegister);

  // User API
  router.put("/api/edit-user", userController.editUser);
  router.delete("/api/delete-user", userController.deleteUser);
  router.get("/api/get-all-user", userController.getAllUsers);

  //AllCode API
  router.get("/api/get-allcode", allCodeController.getAllCodeService);

  return app.use("/", router);
};

module.exports = initWebRoutes;
