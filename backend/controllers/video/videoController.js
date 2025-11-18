const Video = require('../../models/video/Video');
const User = require('../../models/User');
const { moderateContent } = require('../../config/openai');
const path = require('path');

// Video yükleme
const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const userId = req.user._id;

    // Alanların dolu olduğunu kontrol et
    if (!title) {
      return res.status(400).json({ message: 'Video başlığı zorunludur' });
    }

    // Başlık uzunluğu kontrolü
    if (title.length > 100) {
      return res.status(400).json({ message: 'Başlık 100 karakterden uzun olamaz' });
    }

    // Açıklama uzunluğu kontrolü
    if (description && description.length > 1000) {
      return res.status(400).json({ message: 'Açıklama 1000 karakterden uzun olamaz' });
    }

    // OpenAI ile içerik denetimi
    const titleModeration = await moderateContent(title);
    if (titleModeration.flagged) {
      return res.status(400).json({ message: 'Video başlığı uygunsuz içerik içeriyor' });
    }

    if (description) {
      const descriptionModeration = await moderateContent(description);
      if (descriptionModeration.flagged) {
        return res.status(400).json({ message: 'Video açıklaması uygunsuz içerik içeriyor' });
      }
    }

    // Dosya yüklendi mi kontrol et
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir video dosyası seçin' });
    }

    // Video nesnesi oluştur
    const video = new Video({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      user: userId,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${req.file.filename.replace(path.extname(req.file.filename), '.png')}`
    });

    // Videoyu kaydet
    const savedVideo = await video.save();

    // Kullanıcının videolarına ekle
    await User.findByIdAndUpdate(userId, {
      $push: { videos: savedVideo._id }
    });

    res.status(201).json({
      message: 'Video başarıyla yüklendi',
      video: savedVideo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tüm videoları getir
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true, isBanned: false })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tek bir videoyu getir
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'name avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    // Video banlanmış mı kontrol et
    if (video.isBanned) {
      return res.status(403).json({ message: 'Bu video moderatörler tarafından kaldırılmıştır' });
    }

    // Görüntüleme sayısını artır
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Videoyu güncelle
const updateVideo = async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    // Kullanıcının videoyu güncelleme yetkisi var mı?
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu videoyu güncelleme yetkiniz yok' });
    }

    // Alanları güncelle
    if (title) {
      if (title.length > 100) {
        return res.status(400).json({ message: 'Başlık 100 karakterden uzun olamaz' });
      }

      const titleModeration = await moderateContent(title);
      if (titleModeration.flagged) {
        return res.status(400).json({ message: 'Video başlığı uygunsuz içerik içeriyor' });
      }

      video.title = title;
    }

    if (description) {
      if (description.length > 1000) {
        return res.status(400).json({ message: 'Açıklama 1000 karakterden uzun olamaz' });
      }

      const descriptionModeration = await moderateContent(description);
      if (descriptionModeration.flagged) {
        return res.status(400).json({ message: 'Video açıklaması uygunsuz içerik içeriyor' });
      }

      video.description = description;
    }

    if (category) video.category = category;
    if (tags) video.tags = tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) video.isPublic = isPublic;

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Videoyu sil
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    // Kullanıcının videoyu silme yetkisi var mı?
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu videoyu silme yetkiniz yok' });
    }

    // Videoyu sil
    await video.remove();

    // Kullanıcının videolarından çıkar
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { videos: video._id }
    });

    res.json({ message: 'Video başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment to a video
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const videoId = req.params.id;
    const userId = req.user._id;

    // Validate comment text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Yorum boş olamaz' });
    }

    if (text.length > 500) {
      return res.status(400).json({ message: 'Yorum 500 karakterden uzun olamaz' });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    // Check if video is banned
    if (video.isBanned) {
      return res.status(403).json({ message: 'Bu video moderatörler tarafından kaldırılmıştır' });
    }

    // Moderate comment content
    const commentModeration = await moderateContent(text);
    if (commentModeration.flagged) {
      return res.status(400).json({ message: 'Yorum uygunsuz içerik içeriyor' });
    }

    // Add comment to video
    video.comments.push({
      user: userId,
      text: text.trim()
    });

    await video.save();

    // Populate user info for the new comment
    const updatedVideo = await Video.findById(videoId)
      .populate('comments.user', 'name avatar');

    // Get the last comment (the one we just added)
    const newComment = updatedVideo.comments[updatedVideo.comments.length - 1];

    res.status(201).json({
      message: 'Yorum başarıyla eklendi',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a video
const getComments = async (req, res) => {
  try {
    const videoId = req.params.id;

    // Check if video exists
    const video = await Video.findById(videoId)
      .populate('comments.user', 'name avatar')
      .select('comments');

    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    // Check if video is banned
    if (video.isBanned) {
      return res.status(403).json({ message: 'Bu video moderatörler tarafından kaldırılmıştır' });
    }

    res.json(video.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const commentId = req.params.commentId;
    const userId = req.user._id;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    // Find the comment
    const comment = video.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    // Check if user is the comment owner or admin
    if (comment.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok' });
    }

    // Remove comment
    comment.remove();
    await video.save();

    res.json({ message: 'Yorum başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Video beğen
const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    video.likes += 1;
    await video.save();

    res.json({ message: 'Video beğenildi', likes: video.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Video beğenme
const dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }

    video.dislikes += 1;
    await video.save();

    res.json({ message: 'Video beğenilmedi', dislikes: video.dislikes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  likeVideo,
  dislikeVideo,
  addComment,
  getComments,
  deleteComment
};