import db from '../models/index';
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (stylistId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&stylistId=${stylistId}`
    return result;
};

let createBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.stylistId || !data.timeType || !data.date
                || !data.fullName

            ) {
                resolve({
                    errCode: 1,
                    errMsg: 'Missing required parameter'
                })
                return;
            } else {
                let token = uuidv4();

                await emailService.sendSimpleEmail({
                    reciverEmail: data.email,
                    customerName: data.fullName,
                    time: data.timeString,
                    stylistName: data.stylistName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.stylistId, token)
                });

                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R4'
                    },
                });

                //create booking
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: { customerId: user[0].id },
                        defaults: {
                            statusId: 'S1',
                            stylistId: data.stylistId,
                            customerId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token
                        },
                    })
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
