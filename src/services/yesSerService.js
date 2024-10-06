import db from "../models/index";
import { uploadImage } from "./imageService";

let createService = async (data, file) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra các trường cần thiết
      if (!data.name || !data.price || !data.description) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
        return;
      }

      // Nếu có file ảnh, tiến hành upload ảnh
      let imageUrl = null;
      if (file) {
        try {
          imageUrl = await uploadImage(file); // Upload ảnh và lấy URL
        } catch (error) {
          console.error("Lỗi upload ảnh:", error);
          resolve({
            errCode: 2,
            errMessage: "Lỗi khi upload ảnh",
          });
          return;
        }
      }

      await db.Service.create({
        image: imageUrl,
        name: data.name,
        description: data.description,
        price: data.price,
      });

      resolve({
        errCode: 0,
        errMessage: "Create service successfully",
      });
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
let updateService = (data, file) => {
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
          service.price = data.price;
          service.description = data.description;

          if (file) {
            try {
              let imageUrl = await uploadImage(file); // Upload ảnh mới và lấy URL
              service.image = imageUrl; // Cập nhật URL ảnh mới vào cơ sở dữ liệu
            } catch (error) {
              console.error("Lỗi upload ảnh:", error);
              resolve({
                errCode: 2,
                errMessage: "Lỗi khi upload ảnh",
              });
              return;
            }
          }

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
      services = services.map((service) => {
        if (service.image) {
          // Không cần chuyển đổi, chỉ trả về URL của ảnh
          service.image = service.image.toString(); // Đảm bảo rằng bạn trả về chuỗi URL
        }
        return service;
      });
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
