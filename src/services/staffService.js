import db from "../models/index";
import emailService from "./emailService";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sendEmailCancelBooking } from "../../src/services/emailService";
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
                        date: date,
                    },
                    include: [
                        {
                            model: db.User,
                            as: "customerData",
                            attributes: ["email", "firstName", "lastName", "address"],
                        },
                        {
                            model: db.User,
                            as: "stylistDataBooking",
                            attributes: ["email", "firstName", "lastName", "address"],
                        },
                        {
                            model: db.Service,
                            as: "services",
                            attributes: ["name"],
                            through: {
                                attributes: [], // Exclude attributes from the through table
                            },
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

let cancelBookingForStaff = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.bookingId) {
                resolve({
                    errCode: 1,
                    errMsg: "Missing required parameter",
                });
                return;
            }

            let booking = await db.Booking.findOne({
                where: {
                    id: data.bookingId,
                    statusId: {
                        [Op.or]: ["S1", "S2"], // Use Op.or to check for either S1 or S2
                    },
                },
                include: [
                    {
                        model: db.User,
                        as: "customerData",
                        attributes: ["email", "firstName"],
                    },
                    {
                        model: db.User,
                        as: "stylistDataBooking",
                        attributes: ["firstName"],
                    },
                ],
                raw: true,
                nest: true,
            });
            if (booking) {
                let dataSend = {
                    receiverEmail: data.email,
                    customerName: data.firstName,
                    stylistName: data.stylistName,
                    time: data.timeString,
                    contactLink: "https://yourwebsite.com/contact",
                };

                await emailService.sendEmailCancelBooking(dataSend);

                await db.Booking.update(
                    { statusId: "S4" },
                    { where: { id: data.bookingId } }
                );

                await db.Payment.update(
                    { paymentStatus: "Failed" },
                    { where: { bookingId: data.bookingId, paymentStatus: "Completed" } }
                );

                resolve({
                    errCode: 0,
                    errMsg: "Booking canceled successfully, email sent",
                });
            } else {
                resolve({
                    errCode: 3,
                    errMsg: "Booking not found",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    getAllBooking: getAllBooking,
    cancelBookingForStaff: cancelBookingForStaff,
};
