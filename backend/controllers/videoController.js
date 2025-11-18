const Video = require('../models/Video');
const User = require('../models/User');
const { moderateContent } = require('../config/openai');
const path = require('path');
const fs = require('fs');

// Tüm videoları getir
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true, isBanned: false })
      .populate('uploader', 'name')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Video yükle
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, category, tags, isPublic, allowComments, showLikes } = req.body;
    
    // Video dosyası kontrolü
    if (!req.file) {
      return res.status(400).json({ message: 'Video dosyası gerekli' });
    }
    
    // Yeni video oluştur
    const video = new Video({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filename: req.file.filename,
      isPublic: isPublic === 'true',
      allowComments: allowComments === 'true',
      showLikes: showLikes === 'true',
      uploader: req.user.id
    });
    
    const savedVideo = await video.save();
    await savedVideo.populate('uploader', 'name');
    
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Video beğen
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // Kullanıcının daha önce beğenip beğenmediğini kontrol et
    const existingLikeIndex = video.likes.findIndex(like => 
      like.user && like.user.toString() === req.user.id
    );
    
    // Kullanıcının daha önce dislike yapıp yapmadığını kontrol et
    const existingDislikeIndex = video.dislikes.findIndex(dislike => 
      dislike.user && dislike.user.toString() === req.user.id
    );
    
    // Eğer kullanıcı daha önce dislike yaptıysa, dislike'ı kaldır
    if (existingDislikeIndex !== -1) {
      video.dislikes.splice(existingDislikeIndex, 1);
    }
    
    // Eğer kullanıcı daha önce beğenmediyse, beğen
    if (existingLikeIndex === -1) {
      video.likes.push({ user: req.user.id });
    } else {
      // Eğer kullanıcı daha önce beğendiyse, beğeniyi kaldır
      video.likes.splice(existingLikeIndex, 1);
    }
    
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Video dislike
exports.dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // Kullanıcının daha önce dislike yapıp yapmadığını kontrol et
    const existingDislikeIndex = video.dislikes.findIndex(dislike => 
      dislike.user && dislike.user.toString() === req.user.id
    );
    
    // Kullanıcının daha önce like yapıp yapmadığını kontrol et
    const existingLikeIndex = video.likes.findIndex(like => 
      like.user && like.user.toString() === req.user.id
    );
    
    // Eğer kullanıcı daha önce like yaptıysa, like'ı kaldır
    if (existingLikeIndex !== -1) {
      video.likes.splice(existingLikeIndex, 1);
    }
    
    // Eğer kullanıcı daha önce dislike yapmadıysa, dislike yap
    if (existingDislikeIndex === -1) {
      video.dislikes.push({ user: req.user.id });
    } else {
      // Eğer kullanıcı daha önce dislike yaptıysa, dislike'ı kaldır
      video.dislikes.splice(existingDislikeIndex, 1);
    }
    
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yorum ekle
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    if (!video.allowComments) {
      return res.status(400).json({ message: 'Bu videoya yorum yapılamaz' });
    }
    
    // OpenAI ile yorum denetimi
    const moderationResult = await moderateContent(text);
    const isFlagged = moderationResult.flagged;
    const flaggedReason = isFlagged ? JSON.stringify(moderationResult.categories) : '';
    
    // Yeni yorum oluştur
    const comment = {
      user: req.user.id,
      text,
      isFlagged,
      flaggedReason
    };
    
    video.comments.push(comment);
    await video.save();
    
    // Yorumu döndür (kullanıcı bilgisiyle)
    await video.populate({
      path: 'comments.user',
      select: 'name'
    });
    
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Trend videoları getir (like ve yorum sayısına göre sıralanmış)
exports.getTrendingVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isPublic: true, isBanned: false })
      .populate('uploader', 'name')
      .sort({ engagementScore: -1 }) // En yüksek etkileşim alanlar önce
      .limit(10); // İlk 10 trend video
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Video sil
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    // Sadece video sahibi veya admin silebilir
    if (video.uploader.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
    }
    
    // Video dosyasını sil
    const videoPath = path.join(__dirname, '../uploads', video.filename);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
    // Veritabanından videoyu sil
    await Video.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Video silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Videoyu ID ile getir
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploader', 'name')
      .populate({
        path: 'comments.user',
        select: 'name'
      });
    
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};