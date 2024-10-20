"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Service.hasMany(models.Feedback, { foreignKey: "serviceId" });
      Service.belongsToMany(models.Booking, {
        through: 'BookingService', foreignKey: 'serviceId', otherKey: 'bookingId', as: "bookings",
      });
    }
  }
  Service.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Service",
      tableName: "services",
    }
  );
  return Service;
};
