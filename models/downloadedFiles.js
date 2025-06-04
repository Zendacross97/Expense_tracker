const {DataTypes} = require('sequelize');
const sequelize = require('../util/db-connection');

const DownloadedFiles = sequelize.define('downloadedFiles', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Sets the default value to the current date and time
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = DownloadedFiles;