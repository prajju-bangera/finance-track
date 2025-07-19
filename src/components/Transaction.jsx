import React, { useEffect, useState } from 'react';
import './Transaction.css';
import { FiEdit2, FiTrash2, FiArrowUpRight, FiArrowDownRight, FiCreditCard, FiDollarSign, FiX } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api/transactions';

const paymentIcons = {
  cash: <FiDollarSign />, 
  card: <FiCreditCard />, 
  bank_transfer: <FiCreditCard />, 
  upi: <FiCreditCard />, 
  other: <FiCreditCard />
};

const expenseCategories = ['Transportation', 'Rent & Utilities', 'Health & Medical', 'Shopping & Entertainment', 'Food & Dining', 'Others'];
const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Others'];
const paymentTypes = ["all", "cash", "card", "bank_transfer", "upi", "other"];

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense',
    date: '',
    paymentMethod: 'cash'
  });
  // Filter states
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}?userId=${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to fetch transactions');
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = search === "" || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesPayment = paymentFilter === "all" || t.paymentMethod === paymentFilter;
    const txnDate = new Date(t.date);
    const matchesDateFrom = !dateFrom || txnDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || txnDate <= new Date(dateTo);
    return matchesSearch && matchesType && matchesPayment && matchesDateFrom && matchesDateTo;
  });

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      date: new Date(transaction.date).toISOString().split('T')[0],
      paymentMethod: transaction.paymentMethod
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          amount: parseFloat(editFormData.amount),
          userId
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to update transaction');
      }

      // Refresh transactions
      await fetchTransactions();
      setEditingTransaction(null);
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      alert('Delete failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="transaction-page">
      <h2 className="transaction-title">All Transactions</h2>
      {error && <div className="transaction-error">{error}</div>}
      {/* Filters */}
      <div className="transaction-filters">
        <input
          type="text"
          placeholder="Search description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="filter-input"
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="filter-select">
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="filter-select">
          <option value="all">All Payments</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="upi">UPI</option>
          <option value="other">Other</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="filter-input"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="filter-input"
        />
      </div>
      {loading ? (
        <div className="transaction-loading">Loading...</div>
      ) : (
        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr><td colSpan={7} className="no-data">No transactions found.</td></tr>
              ) : (
                filteredTransactions.map(txn => (
                  <tr key={txn._id} className={`txn-row ${txn.type}`}>
                    <td>
                      {txn.type === 'income' ? <FiArrowDownRight className="income-icon" /> : <FiArrowUpRight className="expense-icon" />}
                      <span className="txn-type">{txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}</span>
                    </td>
                    <td>{txn.description}</td>
                    <td className={txn.type === 'income' ? 'income-amt' : 'expense-amt'}>
                      {Number(txn.amount).toLocaleString('en-IN')}
                    </td>
                    <td>{txn.category}</td>
                    <td>{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className="payment-icon">{paymentIcons[txn.paymentMethod] || <FiCreditCard />}</span>
                      <span className="payment-method-label">{txn.paymentMethod}</span>
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(txn)}>
                        <FiEdit2 />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(txn._id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h3>Edit Transaction</h3>
              <button onClick={() => setEditingTransaction(null)} className="close-btn">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={editFormData.amount}
                  onChange={handleEditFormChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditFormChange}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditFormChange}
                  required
                >
                  {(editFormData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={editFormData.paymentMethod}
                  onChange={handleEditFormChange}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingTransaction(null)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 