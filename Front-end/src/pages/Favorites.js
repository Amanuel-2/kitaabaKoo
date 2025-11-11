import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Department.css';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const favorites = user?.favorites || [];

  return (
    <div className="department-container">
      <div className="department-header">
        <button onClick={() => navigate('/home')} className="back-button">← Back</button>
        <h1 className="page-title">My Favorites</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">You haven't favorited any books yet.</div>
      ) : (
        <div className="books-list">
          {favorites.map((book) => (
            <div key={book._id} className="book-card">
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">By {book.author}</p>
                <p className="book-meta">Department: {book.department?.name || 'n/a'}</p>
              </div>
              <div className="book-actions">
                <button onClick={() => navigate(`/department/${book.department?._id}`)} className="download-button">Open</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
