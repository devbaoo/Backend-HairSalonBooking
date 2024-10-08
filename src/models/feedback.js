"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Feedback.belongsTo(models.Booking, { foreignKey: "bookingId" });
      Feedback.belongsTo(models.User, { foreignKey: "userId" });
      Feedback.belongsTo(models.Service, { foreignKey: "serviceId" });
    }
  }
  Feedback.init(
    {
      rating: DataTypes.INTEGER,
      comment: DataTypes.STRING,
      bookingId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      serviceId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Feedback",
      tableName: "feedback",
    }
  );
  return Feedback;
};
