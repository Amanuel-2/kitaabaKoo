const express = require('express');
const cors = require('cors');

const router = express.Router();

// Apply CORS specifically for this debug route so browser can test
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
router.use(cors({ origin: allowedOrigin, exposedHeaders: ['Content-Disposition', 'Content-Length'] }));
router.options('/cors', cors());

// GET /api/debug/cors
router.get('/cors', (req, res) => {
  console.log('CORS debug request received from origin:', req.headers.origin);
  // Ensure explicit headers are present on the response
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');
  res.json({ ok: true, origin: req.headers.origin || null, note: 'This endpoint is for debugging CORS headers' });
});

module.exports = router;
