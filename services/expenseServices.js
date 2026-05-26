const Expense = require('../models/expense_model');

exports.createExpense = async (data, session) => {
  const [expense] = await Expense.create([data], { session });
  return expense;
};

exports.getExpenseById = async (expenseId, session) => {
  return await Expense.findById(expenseId).session(session);
};

exports.getExpenseByUserId = async (userId, { page, limit } = {}) => {
  try {
    let expensesQuery = Expense.find({ userId: userId }).sort({ createdAt: -1 }); // filter directly
    // apply pagination only if page & limit are provided
    if (page && limit) {
      expensesQuery = expensesQuery
        .skip((page - 1) * limit)
        .limit(limit);
    }

    return await expensesQuery.lean(); // lean for performance
  } catch (error) {
    throw new Error(`Error fetching expenses: ${error.message}}`);
  }
};

exports.countExpensesByUserId = async (userId) => {
  try {
    return await Expense.countDocuments({ userId });
  } catch (error) {
    throw new Error(`Error counting expenses: ${error.message}`);
  }
};

exports.getMonthlyExpensesByYearForUser = async (userId, year) => {
  try {
    return await Expense.aggregate([
      { $match: { userId, createdAt: { 
        $gte: new Date(`${year}-01-01`), 
        $lte: new Date(`${year}-12-31`) 
      }}},
      { $group: {
        _id: { month: { $month: "$createdAt" } },
        totalAmount: { $sum: "$amount" }
      }},
      { $project: {
        month: "$_id.month",
        totalAmount: 1,
        _id: 0
      }},
      { $sort: { month: 1 } }
    ]);
  } catch (error) {
    throw new Error(`Error fetching monthly expenses: ${error.message}`);
  }
};

exports.getDailyExpensesByMonthForUser = async (userId, year, month) => {
  try {
    return await Expense.aggregate([
      { $match: { userId, createdAt: { 
        $gte: new Date(`${year}-${month}-01`), 
        $lte: new Date(`${year}-${month}-31`) 
      }}},
      { $group: {
        _id: { day: { $dayOfMonth: "$createdAt" }, description: "$description", category: "$category" },
        totalAmount: { $sum: "$amount" }
      }},
      { $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        description: "$_id.description",
        category: "$_id.category",
        totalAmount: 1,
        _id: 0
      }},
      { $sort: { date: 1 } }
    ]);
  } catch (error) {
    throw new Error(`Error fetching daily expenses: ${error.message}`);
  }
};

exports.deleteExpenseById = async (expenseId, session) => {
  return await Expense.findByIdAndDelete(expenseId).session(session);
};