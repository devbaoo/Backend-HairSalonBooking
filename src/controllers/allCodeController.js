import allCodeService from "../services/allCodeService";

let getAllCodeService = async (req, res) => {
  try {
    let type = req.query.type;
    let data = await allCodeService.getAllCodeService(type);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  getAllCodeService: getAllCodeService,
};
