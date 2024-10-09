import db from "../models/index";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
require("dotenv").config();

let getAllBooking = (date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!date) {
                resolve({
                    errCode: 1,
                    errMsg: "Missing required parameter",
                });
                return;
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: "S2",
                        date: date,
                    },
                    include: [
                        {
                            model: db.User,
                            as: "customerData",
                            attributes: ["email", "firstName", "address"],
                        },
                        {
                            model: db.Allcode,
                            as: "timeTypeDataBooking",
                            attributes: ["valueEn", "valueVi"],
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




module.exports = {
    getAllBooking: getAllBooking
};