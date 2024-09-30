import stylistService from '../services/stylistService';


let getAllStylists = async (req, res) => {
    try {
        let doctors = await stylistService.getAllStylists();
        return res.status(200).json(doctors);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        })
    }
};

let postInfoStylist = async (req, res) => {
    try {
        let response = await stylistService.saveDetailInfoStylist(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        });
    }
};

let getDetailStylistById = async (req, res) => {
    try {
        let info = await stylistService.getDetailStylistById(req.query.id);
        return res.status(200).json(info)
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        })
    }
};

let createSchedule = async (req, res) => {
    try {
        let response = await stylistService.createSchedule(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        })
    }
};

let getScheduleByDate = async (req, res) => {
    try {
        let response = await stylistService.getScheduleByDate(req.query.stylistId, req.query.date);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        })
    }
};

let getListCustomerForDoctor = async (req, res) => {
    try {
        let response = await stylistService.getListCustomerForDoctor(req.query.stylistId, req.query.date);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);

        return res.status(200).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        })
    }
};

module.exports = {
    getAllStylists: getAllStylists,
    postInfoStylist: postInfoStylist,
    getDetailStylistById: getDetailStylistById,
    createSchedule: createSchedule,
    getScheduleByDate: getScheduleByDate,
    getListCustomerForDoctor: getListCustomerForDoctor

}