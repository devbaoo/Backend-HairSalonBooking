import express from "express";
import userController from "../controllers/userController";

let router = express.Router();

let initWebRoutes = (app) => {
  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.handleRegister);
  router.put("/api/edit-user", userController.editUser);
  router.delete("/api/delete-user", userController.deleteUser);
  router.get("/api/get-all-user", userController.getAllUsers);

  return app.use("/", router);
};

module.exports = initWebRoutes;
