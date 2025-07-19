import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaRupeeSign, FaArrowUp, FaArrowDown, FaWallet, FaChartPie } from "react-icons/fa";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

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
        const res = await fetch(`https://finance-track-cslx.onrender.com/api/transactions?userId=${userId}`);
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

  // Group transactions by day for the graph
  const graphDataMap = {};
  transactions.forEach(txn => {
    const date = new Date(txn.date);
    // Format as 'dd MMM' (e.g., '12 Jan')
    const dayLabel = `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('default', { month: 'short' })}`;
    if (!graphDataMap[dayLabel]) {
      graphDataMap[dayLabel] = { name: dayLabel, income: 0, expense: 0, _date: date };
    }
    if (txn.type === 'income') graphDataMap[dayLabel].income += Number(txn.amount);
    if (txn.type === 'expense') graphDataMap[dayLabel].expense += Number(txn.amount);
  });
  const graphData = Object.values(graphDataMap).sort((a, b) => a._date - b._date);

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
        <h3 className="dashboard-graph-title">Income & Expense Comparison</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Line
              type="monotone"
              dataKey="income"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5, stroke: "#2563eb", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 7 }}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 5, stroke: "#dc2626", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 7 }}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 