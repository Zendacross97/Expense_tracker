const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  description: { type: String, trim: true },
  category: { type: String, enum: ['Fuel', 'Food', 'Electricity', 'Movie'], required: true },
  note: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);