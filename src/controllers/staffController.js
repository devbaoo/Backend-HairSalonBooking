import staffService from '../services/staffService';

let getAllBooking = async (req, res) => {
    try {
        let data = await staffService.getAllBooking(req.query.date);
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



module.exports = {
    getAllBooking: getAllBooking,
    cancelBookingForStaff: cancelBookingForStaff
}