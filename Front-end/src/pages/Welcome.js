import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <div className="welcome-overlay" />
        <header className="welcome-header">
          <div className="brand">KitaabaKoo</div>
          <div className="cta">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-solid">Register</Link>
          </div>
        </header>
        <div className="welcome-content">
          <h1 className="welcome-title">Your Campus Library, Organized</h1>
          <p className="welcome-subtitle">
            Browse, upload, and download course materials by department, year, and semester.
            Built for students and teachers to learn and share more efficiently.
          </p>
          <div className="welcome-actions">
            <Link to="/login" className="btn btn-solid btn-lg">Get Started</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Create an Account</Link>
          </div>
        </div>
      </div>
      <section className="welcome-features">
        <div className="feature">
          <div className="feature-icon">📚</div>
          <h3>Department-based</h3>
          <p>Find books organized by your department for faster discovery.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🎓</div>
          <h3>Year & Semester Filters</h3>
          <p>Filter materials to match your exact curriculum stage.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">☁️</div>
          <h3>Cloud Storage</h3>
          <p>Secure uploads and quick downloads whenever you need them.</p>
        </div>
      </section>
      <footer className="welcome-footer">
        <span>© {new Date().getFullYear()} KitaabaKoo</span>
      </footer>
    </div>
  );
};

export default Welcome;


