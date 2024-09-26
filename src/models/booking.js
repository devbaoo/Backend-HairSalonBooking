'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // define association here
    }
  }

  Booking.init({
    statusId: DataTypes.STRING,
    stylistId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
    date: DataTypes.BIGINT,
    timeType: DataTypes.STRING,
    token: DataTypes.STRING,
    ServiceID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings' // Set explicit table name in lowercase
  });

  return Booking;
};
