import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaRupeeSign, FaArrowUp, FaArrowDown, FaWallet, FaChartPie } from "react-icons/fa";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/transactions?userId=${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to fetch transactions');
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchTransactions();
  }, [userId]);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  // Group transactions by month for the graph
  const graphData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  transactions.forEach(txn => {
    const date = new Date(txn.date);
    const month = months[date.getMonth()];
    let entry = graphData.find(d => d.name === month);
    if (!entry) {
      entry = { name: month, income: 0, expense: 0 };
      graphData.push(entry);
    }
    if (txn.type === 'income') entry.income += Number(txn.amount);
    if (txn.type === 'expense') entry.expense += Number(txn.amount);
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'User');
  }, []);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    // Optionally clear other auth data
    navigate('/login');
  };

  return (
    <div className={`dashboard-page ${theme}`}>
      <Header onThemeToggle={handleThemeToggle} theme={theme} username={username} onLogout={handleLogout} />
      <header className="dashboard-header">
        <h1>Finance Dashboard</h1>
        <p>Welcome! Track your income, expenses, and balance in real time.</p>
      </header>
      <div className="dashboard-cards">
        <div className="card income animate-card">
          <div className="card-icon"><FaArrowUp /></div>
          <div className="card-info">
            <span>Income</span>
            <h2><FaRupeeSign className="inr-icon" /> {income.toLocaleString('en-IN')}</h2>
          </div>
        </div>
        <div className="card expense animate-card">
          <div className="card-icon"><FaArrowDown /></div>
          <div className="card-info">
            <span>Expense</span>
            <h2><FaRupeeSign className="inr-icon" /> {expense.toLocaleString('en-IN')}</h2>
          </div>
        </div>
        <div className="card balance animate-card">
          <div className="card-icon"><FaWallet /></div>
          <div className="card-info">
            <span>Balance</span>
            <h2><FaRupeeSign className="inr-icon" /> {balance.toLocaleString('en-IN')}</h2>
          </div>
        </div>
      </div>
      <div className="dashboard-graph-section">
        <h3 className="dashboard-graph-title">Income & Expense Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#4ade80" name="Income" />
            <Bar dataKey="expense" fill="#f87171" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 