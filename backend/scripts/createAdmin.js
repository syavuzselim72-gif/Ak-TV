const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@akistv.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@akistv.com',
      password: 'ADMİNACCOUNT5434!..,?*8', // Updated password as requested
      isAdmin: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@akistv.com');
    console.log('Password: ADMİNACCOUNT5434!..,?*8 (Please change this password immediately)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
});