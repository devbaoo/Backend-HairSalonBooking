import yesSerService from "../services/yesSerService";

let createService = async (req, res) => {
  try {
    let response = await yesSerService.createService(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
    });
  }
};
let getDetailServiceById = async (req, res) => {
  try {
    let id = req.query.id;
    let response = await yesSerService.getDetailServiceById(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
    });
  }
};
let updateService = async (req, res) => {
  try {
    let response = await yesSerService.updateService(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
    });
  }
};
let deleteService = async (req, res) => {
  try {
    let id = req.query.id;
    let response = await yesSerService.deleteService(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
    });
  }
};
let getAllServices = async (req, res) => {
  try {
    let response = await yesSerService.getAllServices(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMsg: "An error occurred on the server",
    });
  }
};

module.exports = {
  createService: createService,
  getDetailServiceById: getDetailServiceById,
  updateService: updateService,
  deleteService: deleteService,
  getAllServices: getAllServices,
};
