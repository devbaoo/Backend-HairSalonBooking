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


module.exports = {
    getAllStylists: getAllStylists,


}