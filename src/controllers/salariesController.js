import salariesService from "../services/salariesService";

let calculateSalary = async (req, res) => {
  try {
    const { stylistId, month, year } = req.body;
    let response = await salariesService.calculateSalary(
      stylistId,
      month,
      year
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
      details: e.message,
    });
  }
};
let getAllSalaries = async (req, res) => {
  try {
    let response = await salariesService.getAllSalaries();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
      details: e.message,
    });
  }
};
let getSalariesByStylistId = async (req, res) => {
  try {
    const stylistId = req.query.stylistId;
    let response = await salariesService.getSalariesByStylistId(stylistId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
      details: e.message,
    });
  }
};
let updatePaidOnSalaries = async (req, res) => {
  try {
    let response = await salariesService.updatePaidOnSalaries(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
      details: e.message,
    });
  }
};
let getSalariesByMonthAndYear = async (req, res) => {
  try {
    const { month, year } = req.query;
    let response = await salariesService.getSalariesByMonthAndYear(month, year);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
      details: e.message,
    });
  }
};
module.exports = {
  calculateSalary,
  getAllSalaries,
  getSalariesByStylistId,
  updatePaidOnSalaries,
  getSalariesByMonthAndYear,
};
