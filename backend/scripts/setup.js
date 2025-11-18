const mongoose = require('mongoose');
const User = require('../models/User');
const Video = require('../models/Video');
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
    // Create admin user if not exists
    const existingAdmin = await User.findOne({ email: 'admin@akistv.com' });
    if (!existingAdmin) {
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
    } else {
      console.log('Admin user already exists.');
    }

    // Check if videos already exist
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      // Find admin user
      const adminUser = await User.findOne({ email: 'admin@akistv.com' });
      
      if (adminUser) {
        // Sample videos data
        const sampleVideos = [
          {
            title: 'Harika Video İçeriği',
            description: 'Bu video harika içerikler barındırıyor. İzlemekten zevk alacaksınız.',
            category: 'Eğlence',
            tags: ['eğlence', 'komik', 'eğlenceli'],
            filename: 'sample1.mp4',
            isPublic: true,
            uploader: adminUser._id,
            likes: [],
            dislikes: [],
            comments: []
          },
          {
            title: 'Eğlenceli Anlar',
            description: 'Güldüren ve eğlenceli anlar bu videoda toplandı.',
            category: 'Oyun',
            tags: ['oyun', 'eğlence', 'komik'],
            filename: 'sample2.mp4',
            isPublic: true,
            uploader: adminUser._id,
            likes: [],
            dislikes: [],
            comments: []
          },
          {
            title: 'Eğitici İçerik',
            description: 'Bu video ile yeni şeyler öğrenebilirsiniz.',
            category: 'Eğitim',
            tags: ['eğitim', 'öğretici', 'bilgi'],
            filename: 'sample3.mp4',
            isPublic: true,
            uploader: adminUser._id,
            likes: [],
            dislikes: [],
            comments: []
          }
        ];

        // Insert sample videos
        await Video.insertMany(sampleVideos);
        console.log('Sample videos added successfully!');
      }
    } else {
      console.log('Videos already exist in the database. Skipping seeding.');
    }

    console.log('Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
});