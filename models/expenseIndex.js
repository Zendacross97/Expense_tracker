const Users = require('./userModel');
const Expenses = require('./expense_model');
const Orders = require('./orderModel');
const ForgotPasswordRequests = require('./forgotPasswordRequests');
const DownloadedFiles = require('./downloadedFiles');

// Define associations

// Users and Expenses one-to-many relationship
Users.hasMany(Expenses);
Expenses.belongsTo(Users);

// Users and Orders one-to-one relationship
Users.hasOne(Orders);
Orders.belongsTo(Users);

// Users and ForgotPasswordRequests has one-to-many relationship
Users.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(Users);

// Users and DownloadedFiles has one-to-many relationship
Users.hasMany(DownloadedFiles);
DownloadedFiles.belongsTo(Users);

module.exports = {
    Users,
    Expenses,
    Orders,
    ForgotPasswordRequests,
    DownloadedFiles
};