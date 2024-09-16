import userService from "../services/userService";

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
module.exports = {
  handleLogin: handleLogin,
  handleRegister: handleRegister,
  editUser: editUser,
  deleteUser: deleteUser,
  getAllUsers: getAllUsers,
};
