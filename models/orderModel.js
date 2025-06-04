const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require('../util/db-connection');

const order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = order;