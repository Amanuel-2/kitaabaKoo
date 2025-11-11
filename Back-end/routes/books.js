// routes/books.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Book = require('../models/Book');
const Department = require('../models/Department');
const cors = require('cors');
const { authenticate, isTeacher } = require('../middleware/auth');

const router = express.Router();

// GridFS Storage configuration - use connection from mongoose
let storage;
let upload;

// Initialize GridFS storage after mongoose connection
const getUploadMiddleware = () => {
  if (!upload) {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected. Cannot initialize GridFS storage.');
    }

    storage = new GridFsStorage({
      db: mongoose.connection.db,
      file: (req, file) => {
        return {
          bucketName: 'uploads',
          filename: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        };
      }
    });

    upload = multer({ 
      storage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDFs and documents are allowed.'));
        }
      }
    });
  }
  return upload;
};

// allow CORS for this router
router.use(cors());
router.options('/', cors());
router.options('/:id', cors());

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

// Upload book (only teachers)
router.post('/', authenticate, isTeacher, (req, res, next) => {
  // Get upload middleware
  const uploadMiddleware = getUploadMiddleware();
  
  // Use upload middleware
  uploadMiddleware.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    // Debug logging
    console.log('=== UPLOAD REQUEST DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? {
      id: req.file.id,
      _id: req.file._id,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bucketName: req.file.bucketName
    } : 'req.file is undefined');
    console.log('req.user:', req.user ? { id: req.user._id, role: req.user.role } : 'req.user is undefined');
    console.log('===========================');

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Extract form data
    const { title, author, department } = req.body;
    
    // Validate required fields
    if (!title || !author || !department) {
      return res.status(400).json({ 
        message: 'Please provide title, author, and department',
        received: { title: !!title, author: !!author, department: !!department }
      });
    }

    // Validate department exists
    let dept;
    try {
      dept = await Department.findById(department);
      if (!dept) {
        return res.status(404).json({ 
          message: 'Department not found',
          departmentId: department
        });
      }
    } catch (deptError) {
      console.error('Department lookup error:', deptError);
      return res.status(400).json({ 
        message: 'Invalid department ID format',
        departmentId: department
      });
    }

    // Get file ID (could be id or _id depending on GridFS version)
    const fileId = req.file.id || req.file._id;
    if (!fileId) {
      console.error('File ID not found in req.file:', req.file);
      return res.status(500).json({ message: 'File ID not found after upload' });
    }

    // Create book record
    const book = new Book({
      title: title.trim(),
      author: author.trim(),
      department: department,
      uploadedBy: req.user._id,
      fileId: fileId,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    // Save book
    await book.save();
    console.log('Book saved successfully:', book._id);

    // Populate and return
    const populatedBook = await Book.findById(book._id)
      .populate('department', 'name')
      .populate('uploadedBy', 'name email');

    res.status(201).json(populatedBook);
  } catch (error) {
    console.error('Upload book error:', error);
    console.error('Error stack:', error.stack);
    
    // If book was created but something else failed, try to clean up
    if (req.file && req.file.id) {
      try {
        const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { 
          bucketName: 'uploads' 
        });
        await gfs.delete(req.file.id);
        console.log('Cleaned up uploaded file');
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

// Delete book (only the uploader teacher can delete)
router.delete('/:id', authenticate, isTeacher, async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Only allow the uploader to delete
    if (book.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this book' });
    }

    // Delete file from GridFS
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    try {
      const fileId = book.fileId;
      if (fileId) {
        await gfs.delete(new mongoose.Types.ObjectId(fileId));
      }
    } catch (err) {
      console.error('Error deleting file from GridFS:', err);
      // continue to delete book record even if file cleanup fails
    }

    await Book.findByIdAndDelete(bookId);

    res.json({ message: 'Book deleted' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

