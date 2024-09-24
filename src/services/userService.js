import db from "../models/index";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import emailService from "./emailService";
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const verifyToken = promisify(jwt.verify);

require("dotenv").config();

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

      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.User.findOne({
          attributes: [
            "id",
            "email",
            "roleId",
            "password",
            "lastName",
            "firstName",
          ],
          where: { email: email },
          raw: true,
        });

        if (user) {
          let isPasswordValid = await bcrypt.compare(password, user.password); // Check password
          if (!isPasswordValid) {
            resolve({
              errCode: 3,
              errMessage: "Incorrect password",
            });
          } else {
            const userInfo = { id: user.id };
            const accessToken = generateAccessToken(userInfo);
            const refreshToken = generateRefreshToken(userInfo);

            // Save refresh token in the database
            await db.User.update({ refreshToken }, { where: { id: user.id } });

            resolve({
              errCode: 0,
              errMessage: "Login successful",
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              roleId: user.roleId,
              accessToken,
              refreshToken,
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
          roleId: data.roleId || "R4",
          phoneNumber: data.phoneNumber,
          positionId: data.positionId,
          image: data.image,
          refreshToken: data.refreshToken,
          resetPasswordToken: data.resetPasswordToken,
          resetPasswordExpires: data.resetPasswordExpires,
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
      let users = await db.User.findAll({ raw: true });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};
const forgotPassword = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email) {
        resolve({
          errCode: 1,
          errMessage: "Missing email parameter",
        });
        return;
      }

      let user = await db.User.findOne({
        where: { email: data.email },
      });

      if (!user) {
        resolve({
          errCode: 2,
          errMessage: "User with this email does not exist.",
        });
        return;
      }

      let token = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1h

      // Ensure the token and expiration are saved to the user record
      await db.User.update(
        {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 3600000,
        },
        {
          where: { email: data.email },
        }
      );

      await emailService.sendForgotPasswordEmail(
        user.email,
        user.firstname,
        token
      );

      resolve({
        errCode: 0,
        message: `An email has been sent to ${user.email} with further instructions.`,
      });
    } catch (e) {
      console.error("Error in forgotPassword:", e);
      reject(e);
    }
  });
};

const { User } = require("../models");

const resetPassword = async (resetPasswordToken, newPassword) => {
  // Debug logging
  console.log("resetPasswordToken:", resetPasswordToken);

  // Validate input
  if (!resetPasswordToken) {
    throw new Error("Invalid resetPasswordToken");
  }

  try {
    const user = await User.findOne({
      where: { resetPasswordToken },
    });
    if (!user) {
      throw new Error("Invalid or expired reset password token");
    }

    // Update the user's password and clear the reset token
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      { where: { id: user.id } }
    );

    return {
      errCode: 0,
      message: "Password has been reset successfully.",
    };
  } catch (error) {
    console.error("Error in resetPassword:", error);
    throw error;
  }
};

module.exports = {
  handleUserLogin: handleUserLogin,
  handleRegister: handleRegister,
  editUser: editUser,
  deleteUser: deleteUser,
  getAllUsers: getAllUsers,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
};
