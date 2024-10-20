import staffService from '../services/staffService';

let getBookingPending = async (req, res) => {
    try {
        let data = await staffService.getBookingPending(req.query.date);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(200).json({
            errCode: 1,
            message: "Internal Server Error",
        });
    }
};

let cancelBookingForStaff = async (req, res) => {
    try {
        let response = await staffService.cancelBookingForStaff(req.body);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(200).json({
            errCode: 1,
            message: "Internal Server Error",
        });
    }
};

let getBookingConfirmAndPayment = async (req, res) => {
    try {
        let response = await staffService.getBookingConfirmAndPayment(req.query.date);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(200).json({
            errCode: 1,
            message: "Internal Server Error",
        });
    }
};



module.exports = {
    getBookingPending: getBookingPending,
    cancelBookingForStaff: cancelBookingForStaff,
    getBookingConfirmAndPayment: getBookingConfirmAndPayment
}