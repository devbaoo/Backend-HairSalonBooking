import db from '../models/index';
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&stylistId=${stylistId}`
    return result;
};
let createBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.stylistId || !data.timeType || !data.date
                || !data.fullName || !data.selectedGender || !data.address
            ) {
                resolve({
                    errCode: 1,
                    errMsg: 'Missing required parameter'
                });
                return;
            }

            let token = uuidv4();

            // Find or create user
            let user = await db.User.findOrCreate({
                where: { email: data.email },
                defaults: {
                    email: data.email,
                    roleId: 'R4',
                    firstName: data.fullName,
                    address: data.address,
                    gender: data.selectedGender,
                },
            }).catch(err => {
                console.log("Error in creating user: ", err);
            });

            // If user exists, check for duplicate booking
            if (user && user[0]) {
                let existingBooking = await db.Booking.findOne({
                    where: {
                        stylistId: data.stylistId,
                        customerId: user[0].id,
                        date: data.date,
                        timeType: data.timeType,
                    }
                });

                if (existingBooking) {
                    resolve({
                        errCode: 2,
                        errMsg: 'Booking already exists for the selected time and date'
                    });
                    return;
                }

                // Create a new booking if no duplicates are found
                await db.Booking.create({
                    statusId: 'S1',
                    stylistId: data.stylistId,
                    customerId: user[0].id,
                    date: data.date,
                    timeType: data.timeType,
                    token: token
                }).catch(err => {
                    console.log("Error in creating booking: ", err);
                });

                // Send booking email after booking is successfully created
                await emailService.sendEmailInfoBooking({
                    receiverEmail: data.email,
                    customerName: data.fullName,
                    time: data.timeString,
                    stylistName: data.stylistName,
                    redirectLink: buildUrlEmail(data.stylistId, token)
                }).catch(err => {
                    console.log("Error in sending email: ", err);
                });
            }

            resolve({
                errCode: 0,
                errMsg: 'Customer booking appointment successfully'
            });

        } catch (e) {
            reject(e);
        }
    });
};


let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.stylistId) {
                resolve({
                    errCode: 1,
                    errMsg: 'Missing required parameter'
                });
                return;
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        stylistId: data.stylistId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false // raw: false so we can use the save method of sequelize
                });

                if (appointment) {
                    appointment.statusId = 'S2';
                    await appointment.save(); // Corrected from 'booking.save'
                    resolve({
                        errCode: 0,
                        errMsg: 'Customer verified booking appointment successfully'
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMsg: 'Appointment has been activated or does not exist'
                    });
                }
            }
        } catch (e) {
            console.error('Error in postVerifyBookAppointment service:', e);
            reject(e);
        }
    });
};

module.exports = {
    createBookAppointment: createBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
}
