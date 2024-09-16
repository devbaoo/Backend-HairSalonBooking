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
let editUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check for required parameters
      if (!data.positionId || !data.gender || !data.roleId || !data.id) {
        resolve({
          errCode: 1,
          errMessage: "Missing input parameter",
        });
        return;
      }

      // Find user by primary key (id)
      let user = await db.User.findByPk(data.id, { raw: false });

      if (user) {
        // Update user properties
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        user.gender = data.gender;
        user.phoneNumber = data.phoneNumber;
        user.positionId = data.positionId;
        user.image = data.image;

        // Save the updated user
        await user.save();

        resolve({
          errCode: 0,
          message: "Update user successfully!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "User not found",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm người dùng theo ID
      let user = await db.User.findOne({
        where: { id: userId },
      });
      if (user) {
        // Xóa người dùng đã tìm thấy
        await db.User.destroy({
          where: { id: userId },
        });
        resolve({
          errCode: 0,
          message: "User deleted successfully",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "User not found",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getAllUsers = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.users) {
        resolve({
          errCode: 1,
          errMessage: "No User",
        });
        return;
      }
      let users = await db.User.findAll({ raw: true });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  handleRegister: handleRegister,
  editUser: editUser,
  deleteUser: deleteUser,
  getAllUsers: getAllUsers,
};
