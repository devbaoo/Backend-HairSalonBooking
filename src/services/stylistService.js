require('dotenv').config();
import db from '../models/index';
import { where } from 'sequelize';
import _, { includes } from 'lodash';
import { raw } from 'body-parser';


let getAllStylists = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let stylists = await db.User.findAll({
                where: { roleId: 'R3' },
                attributes: {
                    exclude: ['password', 'image']
                },
            });
            resolve({
                errCode: 0,
                data: stylists
            });
        } catch (e) {
            reject(e);
        }
    });
};

let saveDetailInfoStylist = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.stylistId || !inputData.contentHTML
                || !inputData.contentMarkdown || !inputData.action
                || !inputData.note || !inputData.serviceId
            ) {
                resolve({
                    errCode: 1,
                    errMsg: 'Input data is required'
                });
            } else {
                // upsert to Markdown
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        stylistId: inputData.stylistId
                    });
                    resolve({
                        errCode: 0,
                        errMsg: 'Stylist information created successfully!'
                    });
                } else if (inputData.action === 'EDIT') {
                    let stylistMarkdown = await db.Markdown.findOne({
                        where: { stylistId: inputData.stylistId },
                        raw: false
                    });
                    if (stylistMarkdown) {
                        stylistMarkdown.contentHTML = inputData.contentHTML;
                        stylistMarkdown.contentMarkdown = inputData.contentMarkdown;
                        stylistMarkdown.description = inputData.description;
                        await stylistMarkdown.save();
                        resolve({
                            errCode: 0,
                            errMsg: 'Stylist information updated successfully!'
                        });
                    } else {
                        resolve({
                            errCode: 2,
                            errMsg: 'Stylist not found!'
                        });
                    }
                }

                //upsert to Stylist_info table
                let stylistInfo = await db.Stylist_Info.findOne({
                    where: {
                        stylistId: inputData.stylistId,
                    },
                    raw: false
                })
                if (stylistInfo) {
                    //update
                    stylistInfo.stylistId = inputData.stylistId;

                    stylistInfo.note = inputData.note;
                    stylistInfo.serviceId = inputData.serviceId;
                    await stylistInfo.save();
                } else {
                    //create
                    await db.Stylist_Info.create({
                        stylistId: inputData.stylistId,
                        note: inputData.note,
                        serviceId: inputData.serviceId,
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getDetailStylistById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMsg: 'Missing required parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: id },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },

                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Stylist_Info,
                            attributes: {
                                exclude: ['id', 'stylistId']
                            },
                        },
                    ],
                    raw: false,
                    nest: true
                })
                if (data && data.image) {
                    data.image = Buffer.from(data.image, 'base64').toString('binary');
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
};

let createSchedule = (scheduleData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!scheduleData.arrSchedule || !scheduleData.arrSchedule.length) {
                resolve({
                    errCode: 1,
                    errMsg: 'Missing required parameter: arrSchedule'
                });
                return;
            }

            // Extract stylistId and date from the first schedule item
            const stylistId = scheduleData.arrSchedule[0].stylistId;
            const date = scheduleData.arrSchedule[0].date;

            // Check for missing stylistId or date
            if (!stylistId) {
                console.error('stylistId is missing:', scheduleData);
                resolve({
                    errCode: 2,
                    errMsg: 'Missing required parameter: stylistId'
                });
                return;
            }
            if (!date) {
                resolve({
                    errCode: 3,
                    errMsg: 'Missing required parameter: date'
                });
                return;
            }

            let schedule = scheduleData.arrSchedule.map(time => {
                time.maxNumber = MAX_NUMBER_SCHEDULE;
                return time;
            });

            // Fetch existing schedules for the stylist on the specified date
            let existing = await db.Schedule.findAll({
                where: {
                    stylistId: stylistId,
                    date: date
                },
                attributes: ['timeType', 'date', 'stylistId', 'maxNumber'],
                raw: true
            });

            // Adjust existing schedules' dates to ensure proper comparison
            existing = existing.map(time => {
                time.date = new Date(time.date).getTime(); // Ensure date is in the same format
                return time;
            });

            // Use _.differenceWith to find schedules that need to be created
            let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                return a.timeType === b.timeType && a.date === b.date;
            });

            // If there are new schedules, insert them into the database
            if (toCreate && toCreate.length > 0) {
                await db.Schedule.bulkCreate(toCreate);
            }
            resolve({
                errCode: 0,
                errMsg: 'Schedule created successfully!'
            });
        } catch (e) {
            reject({
                errCode: -1,
                errMsg: 'An error occurred while creating the schedule'
            });
        }
    });
};


module.exports = {
    getAllStylists: getAllStylists,
    saveDetailInfoStylist: saveDetailInfoStylist,
    getDetailStylistById: getDetailStylistById,
    createSchedule: createSchedule
}