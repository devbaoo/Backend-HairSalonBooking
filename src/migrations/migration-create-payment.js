'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Payment', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            paymentStatus: {
                type: Sequelize.STRING,
            },
            paymentAmount: {
                type: Sequelize.STRING,
            },
            paymentMethod: {
                type: Sequelize.STRING,
            },
            payerEmail: {
                type: Sequelize.STRING,
            },
            paymentToken: {
                type: Sequelize.STRING,
            },
            bookingId: {
                type: Sequelize.INTEGER,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Payment');
    }
};