'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Allcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Allcode.hasMany(models.User, { foreignKey: 'positionId', as: 'positionData' })
      Allcode.hasMany(models.User, { foreignKey: 'gender', as: 'genderData' })
      Allcode.hasMany(models.Schedule, { foreignKey: 'timeType', as: 'timeTypeData' })
      Allcode.hasMany(models.Booking, { foreignKey: 'timeType', as: 'timeTypeDataBooking' })


      // Allcode.hasMany(models.Stylist_Info, { foreignKey: 'priceId', as: 'priceTypeData' })
      // Allcode.hasMany(models.Stylist_Info, { foreignKey: 'provinceId', as: 'provinceTypeData' })
      // Allcode.hasMany(models.Stylist_Info, { foreignKey: 'paymentId', as: 'paymentTypeData' })

    }
  };
  Allcode.init({
    keyMap: DataTypes.STRING,
    type: DataTypes.STRING,
    valueEn: DataTypes.STRING,
    valueVi: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Allcode',
    tableName: 'allcodes' // Set explicit table name in lowercase

  });
  return Allcode;
};