const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
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
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@akistv.com' });
    if (!adminUser) {
      console.log('Admin user not found.');
      process.exit(1);
    }

    // Update admin password
    const newPassword = 'ADMİNACCOUNT5434!..,?*8';
    adminUser.password = await bcrypt.hash(newPassword, 12);
    
    await adminUser.save();
    console.log('Admin password updated successfully!');
    console.log('Email: admin@akistv.com');
    console.log('New password: ADMİNACCOUNT5434!..,?*8');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
});