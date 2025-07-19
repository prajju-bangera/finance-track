import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

const financeImage = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"; // Example finance image
const API_URL = "http://localhost:5000/api/auth";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Apply theme from localStorage on mount
    const theme = localStorage.getItem('theme') || 'light';
    document.body.className = theme;
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || (!isLogin && (!form.name || !form.confirm))) {
      showAlert('error', 'Please fill all fields.');
      return;
    }
    if (!isLogin && form.password !== form.confirm) {
      showAlert('error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
      } else {
        res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
        });
      }
      const data = await res.json();
      if (!res.ok) {
        showAlert('error', data.msg || 'Something went wrong');
      } else {
        showAlert('success', isLogin ? 'Login successful!' : 'Registration successful!');
        if (isLogin) {
          // Store username and userId in localStorage for dashboard/profile and transactions
          localStorage.setItem('username', data.user?.name || 'User');
          localStorage.setItem('userId', data.user?.id || '');
          setTimeout(() => navigate('/dashboard'), 800);
        } else {
          setIsLogin(true);
        }
        setForm({ name: '', email: '', password: '', confirm: '' });
      }
    } catch (err) {
      showAlert('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src={financeImage} alt="Finance Tracking" className="finance-img" />
        <div className="overlay-text">
          <h1>Track Your Finances</h1>
          <p>Manage, save, and grow your money with ease.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="form-container animate-slide">
          {alert.show && (
            <div className={`alert ${alert.type}`}>{alert.message}</div>
          )}
          <h2>{isLogin ? "Login" : "Register"}</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
            )}
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            {!isLogin && (
              <input type="password" name="confirm" placeholder="Confirm Password" value={form.confirm} onChange={handleChange} required />
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
            </button>
          </form>
          <div className="toggle-link">
            {isLogin ? (
              <>
                New here? <span onClick={() => setIsLogin(false)}>Create an account</span>
              </>
            ) : (
              <>
                Already have an account? <span onClick={() => setIsLogin(true)}>Login</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 