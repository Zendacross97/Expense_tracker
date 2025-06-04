const { DataTypes } = require("sequelize");
const sequelize = require('../util/db-connection');

const forgotPasswordRequests = sequelize.define('ForgotPasswordRequests', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isactive: {
        type: DataTypes.BOOLEAN,
    }
})

module.exports = forgotPasswordRequests
