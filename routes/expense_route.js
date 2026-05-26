const express = require('express');
const expenseController = require('../controllers/expense_controller');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.get('/', expenseController.getExpensePage);
router.get('/payment_status', userAuthentication.authenticate, expenseController.getPaymentStatus);
router.post('/addExpense', userAuthentication.authenticate, expenseController.addExpense);
router.get('/getExpense', userAuthentication.authenticate, expenseController.getExpense);
router.delete('/deleteExpense/:expenseId', userAuthentication.authenticate, expenseController.deleteExpense);
router.get('/leaderboard', userAuthentication.authenticate, expenseController.getLeaderboard);
router.get('/downloadExpenses', userAuthentication.authenticate, expenseController.downloadExpenses);
router.get('/report', expenseController.getExpenseReportPage);
router.get('/monthlyReport/:year', userAuthentication.authenticate, expenseController.getMonthlyExpense);
router.get('/dailyReport/:year/:month', userAuthentication.authenticate, expenseController.getDailyExpense);

module.exports = router;