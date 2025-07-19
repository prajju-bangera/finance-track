import React, { useState, useRef, useEffect } from "react";
import { FaCalculator, FaUserCircle, FaSun, FaMoon, FaExchangeAlt, FaPlusCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import "./Header.css";
import { useNavigate } from "react-router-dom";

export default function Header({ onThemeToggle, theme, username, onLogout }) {
  const [showCalc, setShowCalc] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  // Close sidebar on navigation (mobile)
  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleCalcInput = (e) => {
    setCalcInput(e.target.value);
  };

  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(calcInput);
      setCalcResult(result);
    } catch {
      setCalcResult("Error");
    }
  };

  const clearCalc = () => {
    setCalcInput("");
    setCalcResult("");
  };

  return (
    <>
      <nav className={`dashboard-header-nav ${theme}`}> 
        <div className="nav-left">
          <div className="mobile-menu-btn">
            <button className="nav-btn hamburger" onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </button>
          </div>
          <button className="nav-btn desktop-only" onClick={() => navigate('/transaction')}>
            <FaExchangeAlt /> Transactions
          </button>
          <button className="nav-btn desktop-only" onClick={() => navigate('/add-transaction')}>
            <FaPlusCircle /> Add Transaction
          </button>
          <button className="nav-btn desktop-only" onClick={() => setShowCalc(true)}>
            <FaCalculator /> Calculator
          </button>
        </div>
        <div className="header-welcome">Welcome, <b>{username}</b></div>
        <div className="nav-right">
          <div className="profile-dropdown-wrapper desktop-only" ref={profileRef}>
            <button className="nav-btn profile-btn" onClick={() => setShowProfile((v) => !v)}>
              <FaUserCircle /> My Profile
            </button>
            {showProfile && (
              <div className={`profile-dropdown ${theme}`}>
                {/* Removed welcome message from dropdown */}
                <button className="logout-btn" onClick={onLogout}><FaSignOutAlt /> Logout</button>
              </div>
            )}
          </div>
          <button className="nav-btn theme-btn desktop-only" onClick={onThemeToggle}>
            {theme === "light" ? <FaMoon /> : <FaSun />} {theme === "light" ? "Dark" : "Light"} Mode
          </button>
        </div>
      </nav>
      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className={`sidebar-overlay`} onClick={() => setSidebarOpen(false)}>
          <div className={`sidebar ${theme}`} onClick={e => e.stopPropagation()}>
            <button className="nav-btn close-sidebar" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
            <button className="nav-btn" onClick={() => handleNavigate('/transaction')}>
              <FaExchangeAlt /> Transactions
            </button>
            <button className="nav-btn" onClick={() => handleNavigate('/add-transaction')}>
              <FaPlusCircle /> Add Transaction
            </button>
            <button className="nav-btn" onClick={() => { setShowCalc(true); setSidebarOpen(false); }}>
              <FaCalculator /> Calculator
            </button>
            <div className="profile-dropdown-wrapper">
              <div className="profile-dropdown sidebar-profile-dropdown">
                {/* Removed welcome message from sidebar */}
                <button className="logout-btn" onClick={onLogout}><FaSignOutAlt /> Logout</button>
              </div>
            </div>
            <button className="nav-btn theme-btn" onClick={onThemeToggle}>
              {theme === "light" ? <FaMoon /> : <FaSun />} {theme === "light" ? "Dark" : "Light"} Mode
            </button>
          </div>
        </div>
      )}
      {/* Calculator Modal */}
      {showCalc && (
        <div className="calc-modal">
          <div className="calc-content">
            <h3>Calculator</h3>
            <input
              type="text"
              value={calcInput}
              onChange={handleCalcInput}
              placeholder="e.g. 12000+3500-500"
              className="calc-input"
            />
            <div className="calc-actions">
              <button onClick={calculate} className="calc-btn">Calculate</button>
              <button onClick={clearCalc} className="calc-btn">Clear</button>
              <button onClick={() => setShowCalc(false)} className="calc-btn close">Close</button>
            </div>
            {calcResult !== "" && (
              <div className="calc-result">Result: <b>{calcResult}</b></div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 