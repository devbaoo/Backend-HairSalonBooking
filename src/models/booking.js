"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // define association here
      Booking.hasOne(models.Feedback, { foreignKey: "bookingId" });
      Booking.belongsTo(models.User, {
        foreignKey: "customerId",
        targetKey: "id",
        as: "customerData",
      });
      Booking.belongsTo(models.User, {
        foreignKey: "stylistId",
        targetKey: "id",
        as: "stylistDataBooking",
      });
      Booking.belongsTo(models.Allcode, {
        foreignKey: "timeType",
        targetKey: "keyMap",
        as: "timeTypeDataBooking",
      });
      Booking.hasOne(models.Payment, {
        foreignKey: "bookingId",
        as: "payment",
      });
      Booking.belongsToMany(models.Service, {
        through: "BookingService",
        foreignKey: "bookingId",
        otherKey: "serviceId",
        as: "services",
      });
    }
  }

  Booking.init(
    {
      statusId: DataTypes.STRING,
      stylistId: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      date: DataTypes.BIGINT,
      timeType: DataTypes.STRING,
      token: DataTypes.STRING,
      pointsAwarded: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "bookings", // Set explicit table name in lowercase
    }
  );

  return Booking;
};
