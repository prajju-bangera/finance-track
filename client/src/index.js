import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddTransaction from './components/AddTransaction';
import Transaction from './components/Transaction';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/transaction" element={<Transaction />} />
        {/* Add a catch-all route for 404 pages */}
        {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);