const express = require('express');
const Department = require('../models/Department');
const Book = require('../models/Book');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single department with books
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const books = await Book.find({ department: req.params.id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      department,
      books
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create department (only teachers)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create departments' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const department = new Department({ name, description });
    await department.save();

    res.status(201).json(department);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


