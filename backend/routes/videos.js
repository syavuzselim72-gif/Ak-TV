const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect, admin } = require('../middleware/auth');

// Multer konfigürasyonu
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece video dosyaları yüklenebilir'));
    }
  }
});

// Tüm videoları getir (public)
router.get('/', videoController.getVideos);

// Trend videoları getir
router.get('/trending', videoController.getTrendingVideos);

// Video yükle (authenticated users)
router.post('/', protect, upload.single('video'), videoController.uploadVideo);

// Video beğen (authenticated users)
router.post('/:id/like', protect, videoController.likeVideo);

// Video dislike (authenticated users)
router.post('/:id/dislike', protect, videoController.dislikeVideo);

// Yorum ekle (authenticated users)
router.post('/:id/comment', protect, videoController.addComment);

// Video detaylarını getir
router.get('/:id', videoController.getVideoById);

// Video sil (video owner or admin)
router.delete('/:id', protect, videoController.deleteVideo);

module.exports = router;