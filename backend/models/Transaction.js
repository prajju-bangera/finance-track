const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  note: { type: String },
  description: { type: String },
  paymentMethod: { type: String },
  paymentStatus: { type: String, enum: ['completed', 'pending'], default: 'completed' },
  paymentDetails: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema); 