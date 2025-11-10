const mongoose = require('mongoose');
const Department = require('../models/Department');
require('dotenv').config();

const departments = [
  { name: 'Computer Science', description: 'Computer Science and Programming' },
  { name: 'Literature', description: 'Literature and Language Studies' },
  { name: 'Engineering', description: 'Engineering and Technology' },
  { name: 'Mathematics', description: 'Mathematics and Statistics' },
  { name: 'Physics', description: 'Physics and Applied Sciences' },
  { name: 'Chemistry', description: 'Chemistry and Chemical Engineering' },
  { name: 'Biology', description: 'Biology and Life Sciences' },
  { name: 'History', description: 'History and Social Studies' },
  { name: 'Business', description: 'Business and Management' },
  { name: 'Medicine', description: 'Medicine and Health Sciences' }
];

const seedDepartments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-library', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Clear existing departments (optional - comment out if you want to keep existing)
    // await Department.deleteMany({});
    // console.log('Cleared existing departments');

    // Insert departments
    for (const dept of departments) {
      try {
        const existing = await Department.findOne({ name: dept.name });
        if (!existing) {
          await Department.create(dept);
          console.log(`Created department: ${dept.name}`);
        } else {
          console.log(`Department already exists: ${dept.name}`);
        }
      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate key errors
          console.error(`Error creating ${dept.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDepartments();

