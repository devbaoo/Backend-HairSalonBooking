'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Salaries extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Salaries.init({
        stylistId: DataTypes.INTEGER,
        BaseSalary: DataTypes.STRING,
        CommissionPercentage: DataTypes.STRING,
        PaidOn: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Salaries',
    });
    return Salaries;
};