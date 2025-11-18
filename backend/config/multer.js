const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads klasörlerini oluştur
const uploadsDir = path.join(__dirname, '../uploads');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Multer storage configuration for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  // Sadece video dosyalarına izin ver
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece video dosyaları yüklenebilir!'), false);
  }
};

// Multer upload middleware
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

module.exports = { uploadVideo };