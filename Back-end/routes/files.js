const express = require('express');
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const Book = require('../models/Book');

const router = express.Router();

// Download file
router.get('/:fileId', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;

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

