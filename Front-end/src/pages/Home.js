import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [departments, setDepartments] = useState([]);
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
      {departments.length === 0 ? (
        <div className="empty-state">
          <p>No departments available yet.</p>
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="department-card"
              onClick={() => handleDepartmentClick(dept._id)}
            >
              <div className="department-icon">📚</div>
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

