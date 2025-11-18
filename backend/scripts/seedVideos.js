const mongoose = require('mongoose');
const Video = require('../models/Video');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Check if videos already exist
    const videoCount = await Video.countDocuments();
    if (videoCount > 0) {
      console.log('Videos already exist in the database. Skipping seeding.');
      process.exit(0);
    }

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@akistv.com' });
    if (!adminUser) {
      console.log('Admin user not found. Please create admin user first.');
      process.exit(1);
    }

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
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding videos:', error);
    process.exit(1);
  }
});