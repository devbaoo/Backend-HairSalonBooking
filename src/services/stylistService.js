require("dotenv").config();
import db from "../models/index";
import { where } from "sequelize";
import _, { includes } from "lodash";
import { raw } from "body-parser";
import emailService from "./emailService";
import { Op } from "sequelize";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

// let getAllStylists = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let stylists = await db.User.findAll({
//         where: { roleId: "R3" },
//         attributes: {
//           exclude: ["password", "image"],
//         },
//       });
//       rresolve(stylists);
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

let getAllStylists = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let stylists = await db.User.findAll({
        where: { roleId: "R3" },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Salaries,
            as: "salaryData",
            attributes: [
              ["id", "SalaryId"],
              "TotalSalary",
              "BaseSalary",
              "Bonuses",
              "Month",
              "Year",
              "PaidOn",
            ],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: stylists,
      });
    } catch (error) {
      reject({
        errCode: 1,
        errMsg: error.message,
      });
    }
  });
};


const createSchedule = (scheduleData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!scheduleData.arrSchedule || !scheduleData.arrSchedule.length) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter: arrSchedule",
        });
        return;
      }

      const stylistId = scheduleData.arrSchedule[0].stylistId;
      const date = scheduleData.arrSchedule[0].date;

      if (!stylistId) {
        console.error("stylistId is missing:", scheduleData);
        resolve({
          errCode: 2,
          errMsg: "Missing required parameter: stylistId",
        });
        return;
      }
      if (!date) {
        resolve({
          errCode: 3,
          errMsg: "Missing required parameter: date",
        });
        return;
      }

      let schedule = scheduleData.arrSchedule.map((time) => {
        return {
          ...time,
          maxNumber: MAX_NUMBER_SCHEDULE,
          statusTime: "enable",
        };
      });

      let existing = await db.Schedule.findAll({
        where: {
          stylistId: stylistId,
          date: date,
        },
        attributes: ["timeType", "date", "stylistId", "maxNumber"],
        raw: true,
      });

      let toCreate = _.differenceWith(schedule, existing, (a, b) => {
        return a.timeType === b.timeType;
      });

      if (toCreate && toCreate.length > 0) {
        await db.Schedule.bulkCreate(toCreate);
      } else {
        resolve({
          errCode: 4,
          errMsg: "No new schedule to create, duplicate timeType found!",
        });
        return;
      }

      resolve({
        errCode: 0,
        errMsg: "Schedule created successfully!",
      });
    } catch (e) {
      reject({
        errCode: -1,
        errMsg: "An error occurred while creating the schedule",
      });
    }
  });
};


let getScheduleByDate = (stylistId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!stylistId || !date) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            stylistId: stylistId,
            date: date,
          },
          include: [
            // lay cai chung
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.User,
              as: "stylistData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!dataSchedule) dataSchedule = [];
        resolve({
          errCode: 0,
          data: dataSchedule,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getListCustomerForStylist = (stylistId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!stylistId || !date) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: {
              [Op.or]: ["S2", "S3"],
            },
            stylistId: stylistId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: "customerData",
              attributes: ["email", "firstName", "lastName", "address", "gender"],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataBooking",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Service,
              as: "services",
              attributes: ["id", "name"], // Include Service ID and name
              through: {
                attributes: [], // Exclude attributes from the through table
              },
            },
          ],
          raw: false,
          nest: true,
        });
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let completeService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.bookingId) {
        resolve({
          errCode: 1,
          errMsg: "Missing required parameter",
        });
        return;
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            id: data.bookingId,
            statusId: 'S2'
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S3";
          await appointment.save();
        }

        await emailService.sendEmailCompleteService({
          receiverEmail: data.email, // Ensure receiverEmail is set correctly
          stylistName: data.stylistName,
          customerName: data.customerName,
          serviceDate: data.serviceDate,
          serviceTime: data.serviceTime,
          feedbackLink: data.feedbackLink, // Include feedback link if needed
        });

        resolve({
          errCode: 0,
          errMsg: "Ok",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getAllStylists: getAllStylists,
  createSchedule: createSchedule,
  getScheduleByDate: getScheduleByDate,
  getListCustomerForStylist: getListCustomerForStylist,
  completeService: completeService,
};
