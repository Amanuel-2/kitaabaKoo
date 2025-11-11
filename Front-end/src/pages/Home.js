import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      setDepartments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClick = (departmentId) => {
    navigate(`/department/${departmentId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading departments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchDepartments} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1 className="page-title">Departments</h1>
      <div className="home-controls">
        <input
          type="search"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          aria-label="Search departments"
        />
      </div>
      {departments.length === 0 ? (
        <div className="empty-state">
          <p>No departments available yet.</p>
        </div>
      ) : (
        <div className="departments-grid">
          {departments
            .filter((d) => d.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
            .map((dept) => (
            <div
              key={dept._id}
              className="department-card"
              onClick={() => handleDepartmentClick(dept._id)}
              style={dept.image ? { backgroundImage: `url(${dept.image})` } : undefined}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleDepartmentClick(dept._id); }}
              aria-label={`Open ${dept.name} department`}
            >
              {/* dark overlay for readability when background image is present */}
              <div className="department-card-overlay" />

              {/* department-specific icon shown for clarity and accessibility */}
              <div className="department-icon">{getDepartmentIcon(dept.name)}</div>

              <h3 className="department-name">{dept.name}</h3>
              {dept.description && (
                <p className="department-description">{dept.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

// Helper: map department names to appropriate icons (emoji fallback)
function getDepartmentIcon(name) {
  if (!name) return '📚';
  const map = {
    'computer science': '💻',
    'information technology': '🖧',
    'business information systems': '📊',
    'civil engineering': '🏗️',
    'information systems': '🗂️',
    'logistics': '🚚',
    'midwifery': '🤱',
    'nursing': '🩺',
    'business administration': '💼',
    'medicine': '⚕️',
    'mechanical engineering': '⚙️',
    'electrical engineering': '⚡',
    'architecture': '🏛️',
    'economics': '📈',
    'law': '⚖️',
    'psychology': '🧠',
    'education': '🎓',
    'pharmacy': '💊',
    'environmental science': '🌿',
    'mathematics': '➗',
    'physics': '🔬',
    'chemistry': '🧪',
    'biology': '🧬',
    'history': '🏺',
    'sociology': '👥',
    'political science': '🗳️',
    'literature': '📚',
    'languages and linguistics': '🗣️'
  };

  const lower = name.toLowerCase();
  // exact or partial match
  for (const key of Object.keys(map)) {
    if (lower.includes(key)) return map[key];
  }

  return '📚';
}

