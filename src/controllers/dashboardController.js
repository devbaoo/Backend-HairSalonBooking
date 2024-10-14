import dashboardService from "../services/dashboardService";

let totalUser = async (req, res) => {
  try {
    let response = await dashboardService.totalUser();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let totalServices = async (req, res) => {
  try {
    let response = await dashboardService.totalServices();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let revenue = async (req, res) => {
  try {
    let response = await dashboardService.revenue();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let totalBookings = async (req, res) => {
  try {
    let response = await dashboardService.totalBookings();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let confirmedBooking = async (req, res) => {
  try {
    let response = await dashboardService.confirmedBooking();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let completedBooking = async (req, res) => {
  try {
    let response = await dashboardService.completedBooking();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let canceledBooking = async (req, res) => {
  try {
    let response = await dashboardService.canceledBooking();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let totalFeedback = async (req, res) => {
  try {
    let response = await dashboardService.totalFeedback();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let totalStylist = async (req, res) => {
  try {
    let response = await dashboardService.totalStylist();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  totalUser,
  totalServices,
  revenue,
  totalBookings,
  confirmedBooking,
  completedBooking,
  canceledBooking,
  totalFeedback,
  totalStylist,
};
