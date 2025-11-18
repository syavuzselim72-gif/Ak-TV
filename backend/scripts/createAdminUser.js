const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

// Create admin user without database connection
const createAdminUser = async () => {
  try {
    console.log('Creating admin user credentials...');
    
    // Display admin user credentials
    console.log('Admin user credentials:');
    console.log('Email: yavuzselim.sezgin@example.com');
    console.log('Password: Admin123!');
    console.log('');
    console.log('To create this user in the database:');
    console.log('1. Make sure MongoDB is running on localhost:27017');
    console.log('2. Run the backend server with "npm run dev"');
    console.log('3. Register with these credentials on the website');
    console.log('4. The system will automatically make this user an admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
createAdminUser();