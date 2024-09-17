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

module.exports = {
    getAllStylists: getAllStylists,

}