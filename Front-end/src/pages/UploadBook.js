import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './UploadBook.css';

const UploadBook = () => {
  const { isTeacher } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    department: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isTeacher) {
      navigate('/');
      return;
    }
    fetchDepartments();
  }, [isTeacher, navigate]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.title || !formData.author || !formData.department || !formData.file) {
      setError('Please fill in all fields and select a file');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(formData.file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('author', formData.author);
      uploadData.append('department', formData.department);
      uploadData.append('file', formData.file);

      // Don't set Content-Type header - let Axios set it automatically with boundary
      await api.post('/books', uploadData);

      setSuccess(true);
      // capture selected department before clearing formData
      const selectedDepartment = formData.department;
      setFormData({
        title: '',
        author: '',
        department: '',
        file: null
      });

      // Reset file input
      const fileInput = document.getElementById('file');
      if (fileInput) fileInput.value = '';

      setTimeout(() => {
        // navigate using captured department id
        navigate(`/department/${selectedDepartment}`);
      }, 2000);
    } catch (err) {
      console.error('Error uploading book:', err);
      setError(err.response?.data?.message || 'Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Book</h2>
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Book uploaded successfully! Redirecting...
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter book title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              placeholder="Enter author name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="file">File (PDF or Word Document) *</label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              required
              accept=".pdf,.doc,.docx"
            />
            {formData.file && (
              <p className="file-info">Selected: {formData.file.name}</p>
            )}
          </div>
          <button
            type="submit"
            className="upload-button"
            disabled={loading || success}
          >
            {loading ? 'Uploading...' : 'Upload Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadBook;

