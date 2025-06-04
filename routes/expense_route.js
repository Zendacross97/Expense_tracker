const express = require('express');
const expenseController = require('../controllers/expense_controller');
const expenseReportController = require('../controllers/expenseReportController');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.get('/payment_status', userAuthentication.authenticate, expenseController.getPaymentStatus);
router.post('/addExpense', userAuthentication.authenticate, expenseController.addExpense);
router.get('/getExpense', userAuthentication.authenticate, expenseController.getExpense);
router.delete('/deleteExpense/:expenseId', userAuthentication.authenticate, expenseController.deleteExpense);
router.get('/leaderboard', userAuthentication.authenticate, expenseController.getLeaderboard);
router.get('/downloadExpenses', userAuthentication.authenticate, expenseController.downloadExpenses);
router.get('/monthlyReport/:year', userAuthentication.authenticate, expenseReportController.getMonthlyExpense);
router.get('/dailyReport/:year/:month', userAuthentication.authenticate, expenseReportController.getDailyExpense);

module.exports = router;