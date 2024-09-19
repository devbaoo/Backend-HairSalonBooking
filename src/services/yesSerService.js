import db from "../models/index";

let createService = (data) => {
  return new Promise((resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.priceId ||
        !data.image ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        db.Service.create({
          image: data.image,
          name: data.name,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
          priceId: data.priceId,
        });
        resolve({
          errCode: 0,
          errMessage: "Create service successfully",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getDetailServiceById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        db.Service.findByPk(id, { raw: true })
          .then((service) => {
            if (service) {
              resolve(service);
            } else {
              resolve({
                errCode: 1,
                errMessage: "Service not found",
              });
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = { createService, getDetailServiceById };
