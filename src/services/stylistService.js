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


module.exports = {
    getAllStylists: getAllStylists,
    saveDetailInfoStylist: saveDetailInfoStylist
}