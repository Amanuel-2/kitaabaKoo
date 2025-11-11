const mongoose = require('mongoose');
const Department = require('../models/Department');
require('dotenv').config();

const departments = [
  { name: 'Computer Science', description: 'Focuses on programming, algorithms, and software development.' },
  { name: 'Information Technology', description: 'Covers systems administration, networking, and IT infrastructure.' },
  { name: 'Business Information Systems (BIS)', description: 'Combines business processes with information systems and technology.' },
  { name: 'Civil Engineering', description: 'Deals with design, construction, and maintenance of infrastructure projects.' },
  { name: 'Information Systems', description: 'Studies how people and organizations use technology to manage information.' },
  { name: 'Logistics', description: 'Focuses on supply chain management and transportation systems.' },
  { name: 'Midwifery', description: 'Specializes in maternal health, childbirth, and postnatal care.' },
  { name: 'Nursing', description: 'Provides training in patient care, clinical practice, and health promotion.' },
  { name: 'Business Administration', description: 'Covers management, finance, marketing, and organizational behavior.' },
  { name: 'Medicine', description: 'Focuses on diagnosis, treatment, and prevention of diseases.' },
  { name: 'Mechanical Engineering', description: 'Designs and analyzes mechanical systems and machines.' },
  { name: 'Electrical Engineering', description: 'Studies electrical systems, electronics, and power generation.' },
  { name: 'Architecture', description: 'Focuses on building design, urban planning, and construction methods.' },
  { name: 'Economics', description: 'Analyzes production, distribution, and consumption of goods and services.' },
  { name: 'Law', description: 'Studies legal systems, justice, and governance.' },
  { name: 'Psychology', description: 'Explores human behavior, cognition, and mental health.' },
  { name: 'Education', description: 'Prepares students for teaching and curriculum development.' },
  { name: 'Pharmacy', description: 'Focuses on drug development, dispensing, and pharmaceutical care.' },
  { name: 'Environmental Science', description: 'Studies ecosystems, sustainability, and environmental protection.' },
  { name: 'Mathematics', description: 'Covers pure and applied mathematical theories and problem-solving.' },
  { name: 'Physics', description: 'Explores matter, energy, and the laws of nature.' },
  { name: 'Chemistry', description: 'Studies substances, reactions, and molecular structures.' },
  { name: 'Biology', description: 'Examines living organisms, genetics, and ecosystems.' },
  { name: 'History', description: 'Analyzes past events, cultures, and civilizations.' },
  { name: 'Sociology', description: 'Studies society, social behavior, and institutions.' },
  { name: 'Political Science', description: 'Explores governance, political systems, and public policy.' },
  { name: 'Literature', description: 'Analyzes written works, genres, and literary theory.' },
  { name: 'Languages and Linguistics', description: 'Studies language structure, acquisition, and communication.' }
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
        // attach a simple Unsplash image URL based on department name
        const nameForImage = encodeURIComponent(dept.name.replace(/[()]/g, ''));
        const imageUrl = `https://source.unsplash.com/600x400/?${nameForImage}`;
        const payload = { ...dept, image: imageUrl };

        const existing = await Department.findOne({ name: dept.name });
        if (!existing) {
          await Department.create(payload);
          console.log(`Created department: ${dept.name}`);
        } else {
          // if exists but no image, update it
          if (!existing.image) {
            existing.image = imageUrl;
            await existing.save();
            console.log(`Updated department image: ${dept.name}`);
          } else {
            console.log(`Department already exists: ${dept.name}`);
          }
        }
      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate key errors
          console.error(`Error creating ${dept.name}:`, error.message);
        }
      }
    }
    // After creating/updating from the list, ensure any existing departments
    // that were not in the list but have empty/missing image fields get a sensible image.
    try {
      const empties = await Department.find({ $or: [{ image: { $exists: false } }, { image: '' }] });
      for (const d of empties) {
        const nameForImage = encodeURIComponent(d.name.replace(/[()]/g, ''));
        d.image = `https://source.unsplash.com/600x400/?${nameForImage}`;
        await d.save();
        console.log(`Filled missing image for existing department: ${d.name}`);
      }
    } catch (err) {
      console.error('Error filling missing images:', err.message);
    }

    console.log('\n✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDepartments();



