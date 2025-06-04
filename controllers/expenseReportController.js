const ExpenseServices = require('../services/expenseServices');

exports.getMonthlyExpense = async (req, res) => {
    try {
        const { year } = req.params;
        if (!year) {
            return res.status(400).json({ error: 'Year parameter is required' });
        }
        const userId = req.user.id;
        const monthlyExpense = await ExpenseServices.getMonthlyExpenseByYearAndById(userId, year);
        
        if (!monthlyExpense || monthlyExpense.length === 0) {
            return res.status(404).json({ error: 'No monthly expense data found' });
        }
        
        res.status(200).json(monthlyExpense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getDailyExpense = async (req, res) => {
    try {
        const { year, month } = req.params;
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year parameters are required' });
        }
        const userId = req.user.id;
        const dailyExpense = await ExpenseServices.getDailyExpenseByYearByMonthAndById(userId, year, month);

        if (!dailyExpense || dailyExpense.length === 0) {
            return res.status(404).json({ error: 'No daily expense data found' });
        }
        
        res.status(200).json(dailyExpense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}