import feedbackService from "../services/feedbackService";

let createFeedback = async (req, res) => {
  try {
    let response = await feedbackService.createFeedback(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
      details: e.message, // Thêm chi tiết lỗi vào phản hồi
    });
  }
};
let getFeedbackByServiceId = async (req, res) => {
  try {
    let serviceId = req.query.serviceId;
    let response = await feedbackService.getFeedbackByServiceId(serviceId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
      details: e.message,
    });
  }
};

export default {
  createFeedback,
  getFeedbackByServiceId,
};
