import userService from "../services/userService";
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

let handleLogin = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let data = await userService.handleUserLogin(email, password);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let handleRegister = async (req, res) => {
  try {
    let data = await userService.handleRegister(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
let editUser = async (req, res) => {
  try {
    let data = await userService.editUser(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
let deleteUser = async (req, res) => {
  try {
    let id = req.body.id;
    let data = await userService.deleteUser(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
let getAllUsers = async (req, res) => {
  try {
    let data = await userService.getAllUsers(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let sendEmailforgotPassword = async (req, res) => {
  try {
    let data = req.body;
    let response = await userService.forgotPassword(data);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in sendEmailforgotPassword:", error);
    res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  console.log("resetPasswordToken in controller:", token);

  // Validate input
  if (!token) {
    return res.status(400).json({
      errCode: 1,
      errMessage: "Invalid resetPasswordToken",
    });
  }

  try {
    const result = await userService.resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      errMessage: error.message,
    });
  }
};
let getUserById = async (req, res) => {
  try {
    let id = req.query.id;
    let data = await userService.getUserById(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  editUser: editUser,
  deleteUser: deleteUser,
  getAllUsers: getAllUsers,
  sendEmailforgotPassword: sendEmailforgotPassword,
  resetPassword: resetPassword,
  getUserById: getUserById,
};
