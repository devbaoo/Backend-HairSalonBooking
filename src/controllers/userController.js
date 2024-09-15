import userService from "../services/userService";

let handleLogin = async (req, res) => {
  try {
    let data = await userService.handleUserLogin(req.body);
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
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  handleLogin: handleLogin,
  handleRegister: handleRegister,
};
