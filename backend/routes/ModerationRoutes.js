const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  isAdmin,
  isModerator,
  banUser,
  unbanUser,
  warnUser,
  banVideo,
  unbanVideo,
  getBannedUsers,
  getBannedVideos,
  getUserWarnings
} = require('../controllers/moderationController');

const router = express.Router();

// Public routes
// router.get('/trending', getTrendingVideos);

// Admin only routes
router.get('/users', protect, isAdmin, getBannedUsers);
router.get('/videos', protect, isAdmin, getBannedVideos);
router.put('/users/:id/ban', protect, isAdmin, banUser);
router.put('/users/:id/unban', protect, isAdmin, unbanUser);
router.put('/users/:id/warn', protect, isAdmin, warnUser);
router.put('/videos/:id/ban', protect, isAdmin, banVideo);
router.put('/videos/:id/unban', protect, isAdmin, unbanVideo);

module.exports = router;