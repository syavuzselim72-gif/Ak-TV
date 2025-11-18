const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { uploadVideo } = require('../../config/multer');
const { 
  uploadVideo: uploadVideoController, 
  getAllVideos, 
  getVideoById, 
  updateVideo, 
  deleteVideo,
  likeVideo,
  dislikeVideo,
  addComment,
  getComments,
  deleteComment
} = require('../../controllers/video/videoController');

const router = express.Router();

// Public routes
router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.get('/:id/comments', getComments);

// Protected routes
router.post('/', protect, uploadVideo.single('video'), uploadVideoController);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);
router.post('/:id/like', protect, likeVideo);
router.post('/:id/dislike', protect, dislikeVideo);
router.post('/:id/comments', protect, addComment);
router.delete('/:videoId/comments/:commentId', protect, deleteComment);

module.exports = router;