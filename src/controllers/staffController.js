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



module.exports = {
    getAllBooking: getAllBooking
}