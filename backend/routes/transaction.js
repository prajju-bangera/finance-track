const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const router = express.Router();

// Add a transaction
router.post('/', async (req, res) => {
  try {
    const { userId, type, amount, category, date, note, description, paymentMethod, paymentStatus, paymentDetails } = req.body;
    if (!userId || !type || !amount || !category || !date) {
      return res.status(400).json({ msg: 'Please fill all required fields' });
    }
    // Optionally, check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const transaction = new Transaction({ userId, type, amount, category, date, note, description, paymentMethod, paymentStatus, paymentDetails });
    await transaction.save();
    res.status(201).json({ msg: 'Transaction added', transaction });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all transactions for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ msg: 'UserId is required' });
    }
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.json({ msg: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Edit a transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await Transaction.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.json({ msg: 'Transaction updated', transaction: updated });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router; 