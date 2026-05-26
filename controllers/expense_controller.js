const ExpenseService = require('../services/expenseServices');
const UserService = require('../services/userServices');
const AwsServices = require('../services/awsServices');
const mongoose = require('mongoose');
const path = require('path');

exports.getExpensePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/expense_view.html'));
};

exports.getPaymentStatus = async (req, res) => {
    try {

        if (!req.user || !req.user.order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderStatus = req.user.order.status;
        res.status(200).json({ orderStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addExpense = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, description, category, note } = req.body; //fetch data from request body

        if (!amount || !category) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Expense fields are incomplete' });
        }
 
        const expense = await ExpenseService.createExpense({ userId: req.user._id, amount, description, category, note }, session);
        await UserService.adjustTotalExpense(req.user._id, amount, session);

        await session.commitTransaction();
        session.endSession();
        res.status(201).json( { message: 'Expense details added successfully', expense } );
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: err.message });
    }
};

exports.downloadExpenses = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        // check premium membership
        if (!req.user.order || req.user.order.status !== 'SUCCESS') {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ error: 'Unauthorized: Not a premium member' });
        }
        const expenses = await ExpenseService.getExpenseByUserId(req.user._id);
        // Check if expense details are found
        if (!expenses || ExpenseService.getExpenseByUserId.length === 0) {

            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'No expense details found' });
        }
        const stringifiedExpense = JSON.stringify(expenses);
        const filename = `Expense${req.user._id}/${new Date().toISOString()}.txt`;
        const fileURL = await AwsServices.uploadToS3(stringifiedExpense, filename);

        // Check if the file was uploaded successfully
        if (!fileURL) {
            await session.abortTransaction();
            session.endSession(); 
            return res.status(500).json({ error: 'Failed to upload file to S3' });
        }

        // save download record in user
        await UserService.addDownloadedFile(req.user._id, fileURL, session);

        const downloadDetails = await UserService.getDownloadedFilesByUserId(req.user._id, session);

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ fileURL, downloadDetails });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: err.message });
    }
}

exports.getExpense = async (req, res) => {
    try {
        // Parse page and limit as numbers
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        // fetch expenses with pagination
        const expense = await ExpenseService.getExpenseByUserId(req.user._id, { page, limit });

        // Check if expense details are found
        if (!expense || expense.length === 0) {
            return res.status(404).json({ error: 'No expense details found' });
        }
        const expenseCount = await ExpenseService.countExpensesByUserId(req.user._id);
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { expenseId } = req.params;

        if (!expenseId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Expense ID is missing' });
        }
        const expense = await ExpenseService.getExpenseById(expenseId, session);
        if (!expense) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Expense not found' });
        }

        // enforce ownership
        if (expense.userId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ error: 'Expense does not belong to this user' });
        }

        // delete expense
        await ExpenseService.deleteExpenseById(expenseId, session);

        // decrement totalExpense
        await UserService.adjustTotalExpense(req.user._id, -expense.amount, session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: err.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await UserService.getUserNameAndTotalExpense(5);
        // Check if leaderboard data is found
        if (!leaderboard || leaderboard.length === 0) {
            return res.status(404).json({ error: 'No leaderboard data found' });
        }
        res.status(200).json({leaderboard});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getExpenseReportPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/expenseReport.html'));
}

exports.getMonthlyExpense = async (req, res) => {
  try {
    const { year } = req.params;
    if (!year) {
      return res.status(400).json({ error: 'Year parameter is required' });
    }

    const monthlyExpense = await ExpenseService.getMonthlyExpensesByYearForUser(req.user._id, year);

    if (!monthlyExpense || monthlyExpense.length === 0) {
      return res.status(404).json({ error: 'No monthly expense data found' });
    }

    res.status(200).json(monthlyExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDailyExpense = async (req, res) => {
  try {
    const { year, month } = req.params;
    if (!year || !month) {
      return res.status(400).json({ error: 'Month and year parameters are required' });
    }

    const dailyExpense = await ExpenseService.getDailyExpensesByMonthForUser(req.user._id, year, month);

    if (!dailyExpense || dailyExpense.length === 0) {
      return res.status(404).json({ error: 'No daily expense data found' });
    }

    res.status(200).json(dailyExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
