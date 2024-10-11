import customerService from '../services/customerService';

let createBookAppointment = async (req, res) => {
    console.log("Received request for createBookAppointment:", req.body);
    try {
        let response = await customerService.createBookAppointment(req.body);
        console.log("Response from createBookAppointment service:", response);
        return res.status(200).json(response);
    } catch (e) {
        console.error("Error creating booking:", e);
        return res.status(500).json({
            errCode: -1,
            errMsg: "An error occurred on the server",
            details: e.message
        });
    }
};


let paymentAndVerifyBookAppointment = async (req, res) => {
    try {
        let response = await customerService.paymentAndVerifyBookAppointment(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.error("Error verifying payment:", e);
        return res.status(500).json({
            errCode: -1,
            errMsg: "An error occurred on the server",
            details: e.message
        });
    }
};

let getBookingById = async (req, res) => {
    try {
        let response = await customerService.getBookingById(
            req.query.customerId,
        );
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMsg: "An error occurred on the server",
        });
    }
};


module.exports = {
    createBookAppointment: createBookAppointment,
    paymentAndVerifyBookAppointment: paymentAndVerifyBookAppointment,
    getBookingById: getBookingById
}