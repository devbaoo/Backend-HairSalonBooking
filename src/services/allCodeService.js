import db from "../models/index";

let getAllCodeService = (type) => {
  return new Promise(async (resolve, reject) => {
    try {
      const services = await db.Allcode.findAll({
        where: { type: type },
      });
      resolve(services);
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  getAllCodeService,
};
