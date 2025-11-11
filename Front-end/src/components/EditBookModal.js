import React, { useState } from 'react';
import './EditBookModal.css';
import api from '../services/api';

const EditBookModal = ({ book, onClose, onSaved }) => {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [year, setYear] = useState(book?.year || '');
  const [semester, setSemester] = useState(book?.semester || '');
  const [saving, setSaving] = useState(false);

  if (!book) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/books/${book._id}`, { title, author, year, semester, department: book.department?._id || book.department });
      if (res.data && res.data.success) {
        onSaved && onSaved(res.data.book);
        onClose && onClose();
      }
    } catch (err) {
      console.error('Failed to save book:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <header className="edit-modal-header">
          <h3>Edit Book</h3>
        </header>
        <div className="edit-modal-body">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <label>Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
          <label>Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <label>Semester</label>
          <input type="number" value={semester} onChange={(e) => setSemester(e.target.value)} />
        </div>
        <footer className="edit-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
};

export default EditBookModal;
