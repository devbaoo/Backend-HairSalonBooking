import db from "../models/index";
import bcrypt from "bcryptjs";

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email || !password) {
        resolve({
          errCode: 1,
          errMessage: "Missing input parameter",
        });
        return;
      }
      let isExist = checkUserEmail(email);
      if (isExist) {
        let user = await db.User.findOne({
          attributes: ["email", "roleId", "password"],
          where: { email: email },
          raw: true,
        });

        if (user) {
          let hashPassword = await bcrypt.compare(password, user.password);
          if (!hashPassword) {
            resolve({
              errCode: 3,
              errMessage: "Incorrect password",
            });
          } else {
            resolve({
              errCode: 0,
              errMessage: "Login successful",
            });
          }
        } else {
          resolve({
            errCode: 2,
            errMessage: "Email not found",
          });
        }
      } else {
        resolve({
          errCode: 2,
          errMessage: "Email not found",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};
let handleRegister = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isExist = await checkUserEmail(data.email);
      if (isExist) {
        resolve({
          errCode: 2,
          errMessage: "Email already exists",
        });
        return;
      } else {
        let hashedPassword = await bcrypt.hash(data.password, 10);
        let user = await db.User.create({
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          gender: data.gender,
          roleId: data.roleId,
          phoneNumber: data.phoneNumber,
          positionId: data.positionId,
          image: data.image,
        });
        resolve({
          errCode: 0,
          message: "OK",
          data: user,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  handleRegister: handleRegister,
};
