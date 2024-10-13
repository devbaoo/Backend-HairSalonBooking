"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("salaries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      stylistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Bảng 'users' chứa stylist
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      BaseSalary: {
        type: Sequelize.DECIMAL(10, 2), // Lương cơ bản
        allowNull: false,
      },
      Bonuses: {
        type: Sequelize.DECIMAL(10, 2), // Tiền thưởng
        defaultValue: 0,
      },
      Month: {
        type: Sequelize.INTEGER, // Tháng (1-12)
        allowNull: false,
      },
      Year: {
        type: Sequelize.INTEGER, // Năm (ví dụ: 2023)
        allowNull: false,
      },
      TotalSalary: {
        type: Sequelize.DECIMAL(10, 2), // Lương cơ bản
        allowNull: false,
      },
      PaidOn: {
        type: Sequelize.DATE, // Ngày thanh toán
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("salaries");
  },
};
