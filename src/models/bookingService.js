'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BookingService extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    BookingService.init({
        bookingId: DataTypes.INTEGER,
        serviceId: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'BookingService',
        tableName: 'bookingServices',
        freezeTableName: true,

    });
    return BookingService;
};