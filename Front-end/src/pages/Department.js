import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Department.css';
import CommentModal from '../components/CommentModal';
import EditBookModal from '../components/EditBookModal';

const Department = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTeacher, user, fetchUser } = useAuth();
  const [department, setDepartment] = useState(null);
  const [books, setBooks] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [commentModalBook, setCommentModalBook] = useState(null);
  const [editModalBook, setEditModalBook] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);
  const [bookSearch, setBookSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchDepartmentData();
  }, [id, filterYear, filterSemester]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterYear) params.set('year', filterYear);
      if (filterSemester) params.set('semester', filterSemester);
      const qs = params.toString();
      const response = await api.get(`/departments/${id}${qs ? `?${qs}` : ''}`);
      setDepartment(response.data.department);
      setBooks(response.data.books);
      setError('');
    } catch (err) {
      console.error('Error fetching department:', err);
      setError('Failed to load department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (book) => {
    try {
      setDownloading(book._id);
      const response = await api.get(`/files/${book.fileId}`, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', book.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await api.delete(`/books/${bookId}`);
      setBooks(books.filter((book) => book._id !== bookId));
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Failed to delete book. Please try again.');
    }
  };

  const handleToggleStar = async (bookId) => {
    try {
      const res = await api.post(`/books/${bookId}/star`);
      if (res.data && res.data.success) {
        const { starCount, stars } = res.data;
        setBooks((prev) => prev.map((b) => (b._id === bookId ? { ...b, stars } : b)));
        // refresh user favorites in context
        try { await fetchUser(); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Error toggling star:', err);
      alert('Failed to toggle favorite. Please try again.');
    }
  };

  const handleAddComment = async (bookId) => {
    const text = (commentText[bookId] || '').trim();
    if (!text) return;
    try {
      const res = await api.post(`/books/${bookId}/comment`, { text });
      if (res.data && res.data.success) {
        const added = res.data.comment;
        setBooks((prev) => prev.map((b) => (b._id === bookId ? { ...b, comments: [...(b.comments || []), added] } : b)));
        setCommentText((prev) => ({ ...prev, [bookId]: '' }));
        setOpenComments((prev) => ({ ...prev, [bookId]: true }));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="error-container">
        <div className="error-message">{error || 'Department not found'}</div>
        <button onClick={() => navigate('/home')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="department-container">
      <div className="department-header">
        <button onClick={() => navigate('/home')} className="back-button">
          ← Back
        </button>
        <h1 className="page-title">{department.name}</h1>
        {department.description && (
          <p className="department-description">{department.description}</p>
        )}
      </div>

      <div className="department-controls">
        <input
          type="search"
          placeholder="Search books by title or author..."
          value={bookSearch}
          onChange={(e) => setBookSearch(e.target.value)}
          className="search-input"
          aria-label="Search books"
        />
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="filter-select year-select"
          aria-label="Filter by year"
        >
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
          <option value="5">5th Year</option>
        </select>
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="filter-select semester-select"
          aria-label="Filter by semester"
        >
          <option value="">All Semesters</option>
          <option value="1">1st Semester</option>
          <option value="2">2nd Semester</option>
        </select>
      </div>

      {books.filter(b => 
          b.title.toLowerCase().includes(bookSearch.trim().toLowerCase()) ||
          b.author.toLowerCase().includes(bookSearch.trim().toLowerCase())
        ).length === 0 ? (
        <div className="empty-state">
          <p>No books available in this department yet.</p>
          {isTeacher && (
            <button
              onClick={() => navigate('/upload')}
              className="upload-button"
            >
              Upload First Book
            </button>
          )}
        </div>
      ) : (
        <div className="books-list">
          {books.filter(b => 
            b.title.toLowerCase().includes(bookSearch.trim().toLowerCase()) ||
            b.author.toLowerCase().includes(bookSearch.trim().toLowerCase())
          ).map((book) => (
            <div key={book._id} className="book-card">
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">By {book.author}</p>
                <p className="book-meta">
                  Uploaded by {book.uploadedBy?.name || 'Unknown'} ({book.uploadedBy?.email || 'n/a'}) •{' '}
                  {formatFileSize(book.fileSize)} •{' '}
                  {new Date(book.createdAt).toLocaleDateString()}
                  {book.year ? ` • Year ${book.year}` : ''}{book.semester ? ` • Semester ${book.semester}` : ''}
                </p>
              </div>
              {/* quick action icons shown above the card */}
              <div className="quick-actions" aria-hidden>
                <button className="quick-action" title="Download" onClick={() => handleDownload(book)}>⬇️</button>
                {isTeacher && book.uploadedBy?._id?.toString() === user?.id?.toString() && (
                  <>
                    <button className="quick-action" title="Edit" onClick={() => setEditModalBook(book)}>✏️</button>
                    <button className="quick-action delete-quick" title="Delete" onClick={() => handleDelete(book._id)}>🗑️</button>
                  </>
                )}
              </div>

              <div className="book-actions">
                <div className="meta-actions">
                  <button
                    className={`star-button ${book.stars && book.stars.some(s => ((s._id ? s._id : s).toString()) === user?.id?.toString()) ? 'starred' : ''}`}
                    onClick={() => handleToggleStar(book._id)}
                    title="Toggle favorite"
                  >
                    {book.stars && book.stars.some(s => ((s._id ? s._id : s).toString()) === user?.id?.toString()) ? '❤️' : '🤍'} {book.stars ? book.stars.length : 0}
                  </button>

                  <button
                    className="comment-toggle"
                    onClick={() => setCommentModalBook(book)}
                    title="Open comments"
                  >
                    💬 {book.comments ? book.comments.length : 0}
                  </button>
                </div>
                {/* Action menu: compact hamburger that reveals download/edit/delete */}
                <div className="action-menu">
                  <button
                    className="action-menu-button"
                    aria-haspopup="true"
                    aria-expanded={openActionId === book._id}
                    onClick={() => setOpenActionId(openActionId === book._id ? null : book._id)}
                    title="More actions"
                  >
                    ☰
                  </button>

                  {openActionId === book._id && (
                    <div className="action-dropdown" role="menu">
                      <button
                        className="action-item"
                        onClick={() => { setOpenActionId(null); handleDownload(book); }}
                        role="menuitem"
                      >
                        <span className="action-icon">⬇️</span>
                        <span>Download</span>
                      </button>

                      {isTeacher && book.uploadedBy?._id?.toString() === user?.id?.toString() && (
                        <>
                          <button
                            className="action-item"
                            onClick={() => { setOpenActionId(null); setEditModalBook(book); }}
                            role="menuitem"
                          >
                            <span className="action-icon">✏️</span>
                            <span>Edit</span>
                          </button>

                          <button
                            className="action-item"
                            onClick={() => { setOpenActionId(null); handleDelete(book._id); }}
                            role="menuitem"
                          >
                            <span className="action-icon">🗑️</span>
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* comments are shown in a modal/page for better mobile UX */}
            </div>
          ))}
        </div>
      )}
      {commentModalBook && (
        <CommentModal
          book={commentModalBook}
          onClose={() => setCommentModalBook(null)}
          onAddComment={(bookId, comment) => {
            setBooks((prev) => prev.map((b) => (b._id === bookId ? { ...b, comments: [...(b.comments || []), comment] } : b)));
          }}
        />
      )}
      {editModalBook && (
        <EditBookModal
          book={editModalBook}
          onClose={() => setEditModalBook(null)}
          onSaved={(updated) => {
            setBooks((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
          }}
        />
      )}
    </div>
  );
};

export default Department;


