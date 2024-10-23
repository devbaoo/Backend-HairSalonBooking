import db from "../models/index";
import { Sequelize } from "sequelize";
import salaries from "../models/salaries";
const { Op } = Sequelize;

const calculateSalary = async (userId, month, year) => {
  try {
    // Lấy thông tin stylist
    const stylist = await db.User.findOne({
      where: {
        id: userId,
        roleId: "R3",
      },
      attributes: ["id", "positionId"],
    });
    if (!stylist) {
      throw new Error("Stylist not found");
    }

    // Xác định BaseSalary dựa trên positionId
    let baseSalary;
    switch (stylist.positionId) {
      case "P0":
        baseSalary = 300;
        break;
      case "P1":
        baseSalary = 400;
        break;
      case "P2":
        baseSalary = 500;
        break;
      default:
        throw new Error("Invalid position");
    }
    // Tính toán Bonuses
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    const bookingsCount = await db.Booking.count({
      where: {
        stylistId: userId,
        statusId: "S3",
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Xác định Bonuses dựa trên số lượng bookings
    let bonuses = 0;
    if (bookingsCount > 10) {
      bonuses = 50;
    }

    // Tính TotalSalary
    const totalSalary = baseSalary + bonuses;

    // Kiểm tra xem đã có bản ghi lương cho stylist này trong tháng và năm này chưa
    const existingSalary = await db.Salaries.findOne({
      where: {
        stylistId: userId,
        Month: month,
        Year: year,
      },
    });

    if (existingSalary) {
      // Nếu đã có, cập nhật bản ghi hiện tại
      if (existingSalary.PaidOn !== null) {
        console.error(
          "Cannot update salary record as it has already been paid."
        );
        return {
          message: "Cannot update salary record as it has already been paid.",
        };
      }
      await db.Salaries.update(
        {
          BaseSalary: baseSalary,
          Bonuses: bonuses,
          TotalSalary: totalSalary,
        },
        {
          where: {
            stylistId: userId,
            Month: month,
            Year: year,
          },
        }
      );
    } else {
      // Nếu chưa có, tạo bản ghi mới
      await db.Salaries.create({
        stylistId: userId,
        BaseSalary: baseSalary,
        Bonuses: bonuses,
        TotalSalary: totalSalary,
        Month: month,
        Year: year,
      });
    }

    return {
      stylistId: userId,
      baseSalary: baseSalary,
      bonuses: bonuses,
      month: month,
      year: year,
      totalSalary: totalSalary,
    };
  } catch (error) {
    throw error;
  }
};
let getAllSalaries = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let salaries = await db.Salaries.findAll({ raw: true });
      resolve(salaries);
    } catch (e) {
      reject(e);
    }
  });
};
let getSalariesByStylistId = async (stylistId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let salaries = await db.Salaries.findAll({
        where: { stylistId: stylistId },
        raw: false,
      });
      resolve(salaries);
    } catch (e) {
      reject(e);
    }
  });
};
let updatePaidOnSalaries = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      } else {
        let salary = await db.Salaries.findByPk(data.id, { raw: false });
        if (salary) {
          salary.PaidOn = data.PaidOn || new Date();
          await salary.save();
          resolve({
            errCode: 0,
            errMessage: "Update salary successfully",
          });
        } else {
          resolve({
            errCode: 1,
            errMessage: "Salary not found",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getSalariesByMonthAndYear = async (month, year) => {
  return new Promise(async (resolve, reject) => {
    try {
      let salaries = await db.Salaries.findAll({
        where: { Month: month, Year: year },
        raw: true,
      });
      resolve(salaries);
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  calculateSalary,
  getAllSalaries,
  getSalariesByStylistId,
  updatePaidOnSalaries,
  getSalariesByMonthAndYear,
};
