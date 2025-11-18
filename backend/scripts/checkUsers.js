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
    // Tüm kullanıcıları listele
    const users = await User.find({});
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Name: ${user.name}, IsAdmin: ${user.isAdmin}`);
    });
    
    // Admin kullanıcıyı bul
    const adminUser = await User.findOne({ email: 'admin@akistv.com' });
    if (adminUser) {
      console.log('\nAdmin user found:');
      console.log(`- Email: ${adminUser.email}`);
      console.log(`- Name: ${adminUser.name}`);
      console.log(`- IsAdmin: ${adminUser.isAdmin}`);
    } else {
      console.log('\nAdmin user not found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
});