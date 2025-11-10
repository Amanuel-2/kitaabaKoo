const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Book = require('../models/Book');
const Department = require('../models/Department');
const { authenticate, isTeacher } = require('../middleware/auth');

const router = express.Router();

// GridFS Storage configuration
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/university-library',
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow PDFs and common document formats
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDFs and documents are allowed.'));
    }
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const { department } = req.query;
    const query = department ? { department } : {};
    
    const books = await Book.find(query)
      .populate('department', 'name')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('department', 'name')
      .populate('uploadedBy', 'name email');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload book (only teachers)
router.post('/', authenticate, isTeacher, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, author, department } = req.body;

    if (!title || !author || !department) {
      return res.status(400).json({ message: 'Please provide title, author, and department' });
    }

    // Verify department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const book = new Book({
      title,
      author,
      department,
      uploadedBy: req.user._id,
      fileId: req.file.id,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    await book.save();

    const populatedBook = await Book.findById(book._id)
      .populate('department', 'name')
      .populate('uploadedBy', 'name email');

    res.status(201).json(populatedBook);
  } catch (error) {
    console.error('Upload book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete book (only the uploader or admin)
router.delete('/:id', authenticate, isTeacher, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is the uploader
    if (book.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own books' });
    }

    // Delete file from GridFS
    const mongoose = require('mongoose');
    const conn = mongoose.connection;
    const gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    await gfs.delete(book.fileId);

    // Delete book record
    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

