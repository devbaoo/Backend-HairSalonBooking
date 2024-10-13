"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Salaries extends Model {
    static associate(models) {
      Salaries.belongsTo(models.User, {
        foreignKey: "stylistId",
        as: "stylist",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Salaries.init(
    {
      stylistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      BaseSalary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Bonuses: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      Month: {
        type: DataTypes.INTEGER, // Lưu trữ tháng (1-12)
        allowNull: false,
      },
      Year: {
        type: DataTypes.INTEGER, // Lưu trữ năm
        allowNull: false,
      },
      TotalSalary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      PaidOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Salaries",
      tableName: "salaries",
      freezeTableName: true,
      indexes: [
        {
          unique: true,
          fields: ["stylistId", "Month", "Year"], // Đảm bảo stylist chỉ có một bản ghi lương mỗi tháng
        },
      ],
    }
  );

  return Salaries;
};
