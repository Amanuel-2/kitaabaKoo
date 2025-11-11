import React, { useState, useMemo } from 'react';
import './CommentModal.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CommentModal = ({ book, onClose, onAddComment }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');

  const uniqueCommenters = useMemo(() => {
    if (!book || !book.comments) return 0;
    const setIds = new Set(book.comments.map(c => (c.user?._id ? c.user._id : c.user).toString()));
    return setIds.size;
  }, [book]);

  if (!book) return null;

  const handleSubmit = async () => {
    const t = (text || '').trim();
    if (!t) return;
    try {
      const res = await api.post(`/books/${book._id}/comment`, { text: t });
      if (res.data && res.data.success) {
        const added = res.data.comment;
        onAddComment && onAddComment(book._id, added);
        setText('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment.');
    }
  };

  return (
    <div className="comment-modal-overlay" role="dialog" aria-modal="true">
      <div className="comment-modal">
        <header className="comment-modal-header">
          <h3>{book.title}</h3>
          <div className="comment-modal-meta">{uniqueCommenters} user(s) commented • {book.comments ? book.comments.length : 0} total</div>
        </header>
        <div className="comment-modal-body">
          <div className="comments-list">
            {(book.comments || []).map((c, idx) => (
              <div key={idx} className="comment-row">
                <div className="comment-row-left">
                  <div className="comment-author">{c.user?.name || 'User'}</div>
                  <div className="comment-date">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <div className="comment-row-right">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
        <footer className="comment-modal-footer">
          <input
            type="text"
            placeholder={user ? `Comment as ${user.name}` : 'Log in to comment'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!user}
          />
          <div className="comment-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={!user || !text.trim()}>Send</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CommentModal;
