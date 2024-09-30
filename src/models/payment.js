'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Payment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Payment.init({
        paymentStatus: DataTypes.STRING,
        paymentAmount: DataTypes.STRING,
        paymentMethod: DataTypes.STRING,
        payerEmail: DataTypes.STRING,
        paymentToken: DataTypes.STRING,
        bookingId: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Payment',
    });
    return Payment;
};