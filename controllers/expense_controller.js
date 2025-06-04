const ExpenseServices = require('../services/expenseServices');
const UserServices = require('../services/userServices');
const AwsServices = require('../services/awsServices');
const sequelize = require('../util/db-connection');

exports.getPaymentStatus = async (req, res) => {
    try {
        const order = await ExpenseServices.getOrderById(req.user.id);
        if (order && order.length !== 0) {
            const orderStatus = order[0].status;
            res.status(200).json({ orderStatus });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addExpense = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        console.log('id:', req.user);
        const { amount, description, category, note } = req.body; //fetch data from request body
        if (!amount || !description || !category ) { //check if all fields are present
            await transaction.rollback();
            return res.status(400).json({ error: 'Expense fields are incomplete' });
        }
        await ExpenseServices.createExpenseWithTransaction(req.body, req.user.id, transaction);
        const oldTotalExpense = await UserServices.getUserByIdWithTransaction(req.user.id, transaction);
        // Check if old total expense is found
        if (!oldTotalExpense || oldTotalExpense.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }
        const newTotalExpense = +oldTotalExpense[0].totalExpense + +amount;
        await UserServices.updateUserTotalExpenseByIdWithTransaction(newTotalExpense, req.user.id, transaction);
        await transaction.commit();
        res.status(201).json( { message: 'Expense details added successfully' });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
};

exports.downloadExpenses = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await ExpenseServices.getOrderById(req.user.id);
        // Check if the user is a premium member
        if (!order || order.length === 0 || order[0].status !== 'SUCCESS') {
            await transaction.rollback();
            return res.status(401).json({ error: 'Unauthorized: Not a premium member' });
        }
        const expense = await ExpenseServices.getExpenseByUserId(req.user.id);
        // Check if expense details are found
        if (!expense || expense.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'No expense details found' });
        }
        const UserId = req.user.id;
        const stringifiedExpense = JSON.stringify(expense);
        const filename = `Expense${UserId}/${new Date()}.txt`;
        const fileURL = await AwsServices.uploadToS3(stringifiedExpense, filename);
        // Check if the file was uploaded successfully
        if (!fileURL) {
            await transaction.rollback();
            return res.status(500).json({ error: 'Failed to upload file to S3' });
        }
        await ExpenseServices.createDownloadedFileWithTransaction(fileURL, req.user.id, transaction);
        const downloadDetails = await ExpenseServices.getDownloadedFilesByUserIdwithTransaction(req.user.id, transaction);
        // Check if download details are found
        if (!downloadDetails || downloadDetails.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'No download details found' });
        }
        await transaction.commit();
        res.status(200).json({ fileURL, downloadDetails });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
}

exports.getExpense = async (req, res) => {
    try {
        // Parse page and limit as numbers
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const expense = await ExpenseServices.getExpenseByIdForPagination(req.user.id, page, limit);
        // Check if expense details are found
        if (!expense || expense.length === 0) {
            return res.status(404).json({ error: 'No expense details found' });
        }
        const expenseCount = await ExpenseServices.countExpensesByUserId(req.user.id);
        const expenseDetails = {
            totalPages: Math.ceil(expenseCount / limit),
            currentPage: page,
            nextPage: page < Math.ceil(expenseCount / limit) ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
            expense: expense
        }
        res.status(200).json(expenseDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    const transaction = await sequelize.transaction();
    const { expenseId } = req.params; 
    try {
        if (expenseId == 'undefined') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Id is missing' });
        }
        const deletedExpense = await ExpenseServices.getExpenseByIdAndUserIdWithTransaction(expenseId, req.user.id, transaction);
        // Check if the expense belongs to the user
        if (!deletedExpense.length) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Expense does not belong to this user' });
        }
        const noOfRows = await ExpenseServices.deleteExpenseByIdAndUserIdWithTransaction(expenseId, req.user.id, transaction);
        // Check if the expense was deleted
        if(noOfRows === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Expense does not belong to this user' });        
        }
        else {
            const oldTotalExpense = await UserServices.getUserByIdWithTransaction(req.user.id, transaction);
            // Update the total expense
            const newTotalExpense = +oldTotalExpense[0].totalExpense - +deletedExpense[0].amount;
            await UserServices.updateUserTotalExpenseByIdWithTransaction(newTotalExpense, req.user.id, transaction);
            await transaction.commit();
            res.status(200).json({ message: 'Expense details deleted successfully' });
        }
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await UserServices.getUserNameAndTotalExpense();
        // Check if leaderboard data is found
        if (!leaderboard || leaderboard.length === 0) {
            return res.status(404).json({ error: 'No leaderboard data found' });
        }
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};