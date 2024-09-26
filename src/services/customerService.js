import db from '../models/index';
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}`
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
                })
                return;
            } else {
                let token = uuidv4();

                await emailService.sendEmailInfoBooking({
                    receiverEmail: data.email,
                    customerName: data.fullName,
                    time: data.timeString,
                    stylistName: data.stylistName,
                    redirectLink: buildUrlEmail(token)
                }).catch(err => {
                    console.log("Error in sending email: ", err);
                });
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
                //create booking
                if (user && user[0]) {
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
                }
                resolve({
                    errCode: 0,
                    errMsg: 'Customer booking appointment successfully'
                })
            }
            resolve({
                errCode: 0,
                data: data
            })
        } catch (e) {
            reject(e)
        }
    })
};




module.exports = {
    createBookAppointment: createBookAppointment
}
