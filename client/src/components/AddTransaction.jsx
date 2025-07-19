import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiArrowUpRight, FiArrowDownRight, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import './AddTransaction.css';
import { useNavigate } from 'react-router-dom';

const expenseCategories = [
  'Transportation',
  'Rent & Utilities',
  'Health & Medical',
  'Shopping & Entertainment',
  'Food & Dining',
  'Others'
];

const incomeCategories = [
  'Salary',
  'Freelance',
  'Investments',
  'Gifts',
  'Others'
];

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: <FiDollarSign /> },
  { value: 'card', label: 'Credit/Debit Card', icon: <FiCreditCard /> },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI Payment' },
  { value: 'other', label: 'Other' }
];

const API_URL = 'https://finance-track-cslx.onrender.com/api/transactions';

const AddTransaction = ({ onClose, refreshTransactions }) => {
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: expenseCategories[0],
    type: 'expense',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    date: new Date().toISOString().split('T')[0],
    paymentDetails: {},
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showOnlinePayment, setShowOnlinePayment] = useState(false);

  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'expense' ? expenseCategories[0] : incomeCategories[0]
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method,
      paymentStatus: method === 'cash' ? 'completed' : 'pending',
      paymentDetails: {}
    }));
    setShowOnlinePayment(['card', 'bank_transfer', 'upi'].includes(method));
  };

  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!userId) {
      setError('User not found. Please login again.');
      navigate('/login'); // Now this will work with our updated routes
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add if using auth
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date, // Keep as string
          userId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add transaction');
      }

      // Success handling
      if (typeof refreshTransactions === 'function') {
        await refreshTransactions();
      }
      
      // Close modal or navigate away
      if (typeof onClose === 'function') {
        onClose();
      } else {
        navigate('/dashboard'); // Fallback navigation
      }
      
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Failed to add transaction');
      
      // If unauthorized, redirect to login
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="add-transaction-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="add-transaction-container modal"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="form-header">
          <h2>Add New Transaction</h2>
          <button onClick={() => { if (onClose) onClose(); navigate('/dashboard'); }} className="close-btn" disabled={isSubmitting}>
            <FiX size={24} />
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-horizontal">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <div className="form-section-title"></div>
              <div className="form-group">
                <label>Type</label>
                <div className="radio-group">
                  <label 
                    className={`radio-option ${formData.type === 'expense' ? 'active' : ''}`}
                    onClick={() => !isSubmitting && handleTypeChange('expense')}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={() => {}}
                      hidden
                      disabled={isSubmitting}
                    />
                    <FiArrowUpRight className="icon" />
                    Expense
                  </label>
                  <label 
                    className={`radio-option ${formData.type === 'income' ? 'active' : ''}`}
                    onClick={() => !isSubmitting && handleTypeChange('income')}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={() => {}}
                      hidden
                      disabled={isSubmitting}
                    />
                    <FiArrowDownRight className="icon" />
                    Income
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <button
                    key={method.value}
                    type="button"
                    className={`payment-method ${formData.paymentMethod === method.value ? 'active' : ''} ${method.value === 'cash' ? 'cash' : ''}`}
                    onClick={() => handlePaymentMethodChange(method.value)}
                    disabled={isSubmitting}
                  >
                    {method.icon && <span className="method-icon">{method.icon}</span>}
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
            {showOnlinePayment && (
              <div className="form-group">
                <label>Payment Details</label>
                {formData.paymentMethod === 'card' && (
                  <>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Card Number"
                      className="payment-detail"
                      onChange={handlePaymentDetailChange}
                      disabled={isSubmitting}
                    />
                    <div className="card-details">
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        className="payment-detail small"
                        onChange={handlePaymentDetailChange}
                        disabled={isSubmitting}
                      />
                      <input
                        type="text"
                        name="cvv"
                        placeholder="CVV"
                        className="payment-detail small"
                        onChange={handlePaymentDetailChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}
                {formData.paymentMethod === 'upi' && (
                  <input
                    type="text"
                    name="upiId"
                    placeholder="UPI ID"
                    className="payment-detail"
                    onChange={handlePaymentDetailChange}
                    disabled={isSubmitting}
                  />
                )}
                {formData.paymentMethod === 'bank_transfer' && (
                  <select name="bank" className="payment-detail" onChange={handlePaymentDetailChange} disabled={isSubmitting}>
                    <option value="">Select Bank</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="sbi">SBI</option>
                    <option value="icici">ICICI Bank</option>
                  </select>
                )}
              </div>
            )}
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddTransaction; 