require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@skillsync.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', existingAdmin.email);
      console.log('Current role:', existingAdmin.role);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user to admin role');
      }
      
      process.exit(0);
    }

    // Create admin user
    console.log('Creating new admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@skillsync.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      department: 'Administration',
      year: 4,
      role: 'admin',
      skills: ['Administration', 'Management'],
      interests: ['System Administration', 'User Management']
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@skillsync.com');
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);

  } catch (error) {
    console.error('Error creating admin user:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser(); 