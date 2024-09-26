import customerService from '../services/customerService';


let createBookAppointment = async (req, res) => {
    try {
        let response = await customerService.createBookAppointment(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        })
    }
};

let postVerifyBookAppointment = async (req, res) => {
    try {
        let response = await customerService.postVerifyBookAppointment(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMsg: 'An error occurred on the server'
        })
    }
}

module.exports = {
    createBookAppointment: createBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
}