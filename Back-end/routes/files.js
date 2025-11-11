const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { authenticate } = require('../middleware/auth');
const Book = require('../models/Book');

const router = express.Router();

// allow CORS for this router (adds Access-Control-Allow-Origin header)
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
router.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  exposedHeaders: ['Content-Disposition', 'Content-Length']
}));

// respond to preflight
router.options('/:fileId', cors());

// Download file
router.get('/:fileId', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Debug logging to help diagnose CORS / download issues
    console.log('Download request for fileId:', fileId, 'origin:', req.headers.origin, 'method:', req.method);

    // Verify the file belongs to a book
    const book = await Book.findOne({ fileId });
    if (!book) {
      return res.status(404).json({ message: 'File not found' });
    }

    const conn = mongoose.connection;
    const gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });

    // Find the file in GridFS
    const files = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found in storage' });
    }

    const file = files[0];

  // Ensure CORS headers are present (in case global middleware wasn't applied)
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

  // Set headers for download
  res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${book.fileName}"`);
  res.setHeader('Content-Length', file.length);

    // Stream the file
    const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Download stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

module.exports = router;


