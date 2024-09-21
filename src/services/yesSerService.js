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
let updateService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        // let service = await db.Service.findByPk(data.id);
        let service = await db.Service.findByPk(data.id, { raw: false });
        if (service) {
          service.name = data.name;
          service.priceId = data.priceId;
          service.image = data.image;
          service.descriptionHTML = data.descriptionHTML;
          service.descriptionMarkdown = data.descriptionMarkdown;

          await service.save();
          resolve({
            errCode: 0,
            errMessage: "Update service successfully",
          });
        } else {
          resolve({
            errCode: 1,
            errMessage: "Service not found",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};
let deleteService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let service = await db.Service.findByPk(id);
        if (service) {
          await db.Service.destroy({
            where: { id: id },
          });
          resolve({
            errCode: 0,
            errMessage: "Delete service successfully",
          });
        } else {
          resolve({
            errCode: 1,
            errMessage: "Service not found",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getAllServices = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let services = await db.Service.findAll();
      resolve(services);
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  createService,
  getDetailServiceById,
  updateService,
  deleteService,
  getAllServices,
};
