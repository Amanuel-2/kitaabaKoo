import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          kitaabaKoo
        </Link>
        <div className="navbar-theme-toggle">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="theme-button"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/" className="navbar-link">
                Home
              </Link>
              {isTeacher && (
                <Link to="/upload" className="navbar-link">
                  Upload Book
                </Link>
              )}
              <span className="navbar-user">
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


