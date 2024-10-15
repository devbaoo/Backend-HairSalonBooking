import db from "../models/index";
import emailService from "./emailService";
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

            // Find the booking by bookingId and statusId "S2"
            let booking = await db.Booking.findOne({
                where: {
                    id: data.bookingId,
                    statusId: "S2", // Active booking
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
                // Send cancellation email to the customer
                let dataSend = {
                    receiverEmail: data.email, // Customer's email
                    customerName: data.firstName, // Customer's name
                    stylistName: data.stylistName, // Stylist's name
                    time: data.timeString, // Appointment time (assuming it's in valueEn)
                    contactLink: "https://yourwebsite.com/contact" // Link for contacting
                };

                await emailService.sendEmailCancelBooking(dataSend);

                // Update the booking status to "S4" (canceled)
                await db.Booking.update(
                    { statusId: "S4" },
                    { where: { id: data.bookingId } }
                );

                // Update the payment status to "Failed" if it was previously "Completed"
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
    cancelBookingForStaff: cancelBookingForStaff
};