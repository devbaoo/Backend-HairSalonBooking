import express from "express";
import userController from "../controllers/userController";

let router = express.Router();

let initWebRoutes = (app) => {
  // Authentication API
  router.post("/api/login", userController.handleLogin); // Tag: Authentication
  router.post("/api/register", userController.handleRegister); // Tag: Authentication

  // User API
  router.put("/api/edit-user", userController.editUser); // Tag: User
  router.delete("/api/delete-user", userController.deleteUser); // Tag: User
  router.get("/api/get-all-user", userController.getAllUsers); // Tag: User

  router.get('/api/get-all-stylist', stylistController.getAllStylists);

  return app.use("/", router);
};

module.exports = initWebRoutes;
