const Order = require('../models/orderModel');
const Expense = require('../models/expense_model');
const DownloadedFiles = require('../models/downloadedFiles');
const sequelize = require('sequelize');
const Op = sequelize.Op;

exports.getOrderById = async (orderId) => {
    try {
        return await Order.findAll({ 
            where: { 
                UserId: orderId,
                status: 'SUCCESS'
            }
        });
    } catch (error) {
        throw new Error(`Error creating order: ${error.message}`);
    }
}

exports.createExpenseWithTransaction = async (data, userId, transaction) => {
    try {
        return await Expense.create({
            ...data,
            UserId: userId
        }, { transaction });
    } catch (error) {
        throw new Error(`Error creating expense: ${error.message}`);
    }
}

exports.getExpenseByUserId = async (userId) => {
    try {
        return await Expense.findAll({
            where: { UserId: userId }
        });
    } catch (error) {
        throw new Error(`Error fetching expense by ID: ${error.message}`);
    }
}

exports.getExpenseByIdForPagination = async (userId, page, limit) => {
    try {
        return await Expense.findAll({
            where: { UserId: userId },
            offset: (page - 1) * limit,
            limit: limit
        });
    } catch (error) {
        throw new Error(`Error fetching expenses: ${error.message}`);
    }
}

exports.getExpenseByIdAndUserIdWithTransaction = async (expenseId, userId, transaction) => {
    try {
        return await Expense.findAll({
            where: { 
                id: expenseId,
                UserId: userId
            },
            transaction
        });
    } catch (error) {
        throw new Error(`Error fetching expense by ID and User ID: ${error.message}`);
    }
}

exports.getMonthlyExpenseByYearAndById = async (userId, year) => {
    try {
        return await Expense.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
            ],
            where: {
                UserId: userId,
                [Op.and]: [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), '=', year)
                ]
            },
            group: ['month']
        });
    } catch (error) {
        throw new Error(`Error fetching monthly expense: ${error.message}`);
    }
}

exports.getDailyExpenseByYearByMonthAndById = async (userId, year, month) => {
    try {
        return await Expense.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                'description',
                'category',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
            ],
            where: {
                UserId: userId,
                [Op.and]: [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), '=', year),
                    sequelize.where(sequelize.fn('MONTH', sequelize.col('createdAt')), '=', month)
                ]
            },
            group: ['date', 'description', 'category']
        });
    } catch (error) {
        throw new Error(`Error fetching daily expense: ${error.message}`);
    }
}

exports.countExpensesByUserId = async (userId) => {
    try {
        return await Expense.count({
            where: { UserId: userId }
        });
    } catch (error) {
        throw new Error(`Error counting expenses: ${error.message}`);
    }
}

exports.deleteExpenseByIdAndUserIdWithTransaction = async (expenseId, userId) => {
    try {
        return await Expense.destroy({
            where: { 
                id: expenseId,
                UserId: userId 
            },
            transaction
        });
    } catch (error) {
        throw new Error(`Error deleting expense: ${error.message}`);
    }
}

exports.createDownloadedFileWithTransaction = async (ulr, userId, transaction) => {
    try {
        return await DownloadedFiles.create({
            fileUrl: ulr,
            UserId: userId
        }, { transaction });
    } catch (error) {
        throw new Error(`Error creating downloaded file: ${error.message}`);
    }
}

exports.getDownloadedFilesByUserIdwithTransaction = async (userId, transaction) => {
    try {
        return await DownloadedFiles.findAll({
            where: { UserId: userId },
            transaction
        });
    } catch (error) {
        throw new Error(`Error fetching downloaded files by User ID: ${error.message}`);
    }
}