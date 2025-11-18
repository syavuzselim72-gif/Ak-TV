const User = require('../models/User');
const Video = require('../models/video/Video');

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }
  next();
};

// Moderator middleware
const isModerator = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }
  next();
};

// Kullanıcıyı banla
const banUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kendini banlayamaz
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendinizi banlayamazsınız' });
    }
    
    // Admin kullanıcıları banlayamaz
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin kullanıcıları banlayamazsınız' });
    }
    
    user.isBanned = true;
    user.banReason = reason;
    user.banDate = new Date();
    await user.save();
    
    res.json({ message: 'Kullanıcı başarıyla banlandı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcının banını kaldır
const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    user.isBanned = false;
    user.banReason = '';
    user.banDate = null;
    await user.save();
    
    res.json({ message: 'Kullanıcının banı kaldırıldı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcıyı uyar
const warnUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Admin kullanıcıları uyaramaz
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin kullanıcıları uyaramazsınız' });
    }
    
    user.warnings.push({
      reason,
      moderator: req.user._id
    });
    
    await user.save();
    
    res.json({ message: 'Kullanıcı başarıyla uyarıldı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Videoyu banla
const banVideo = async (req, res) => {
  try {
    const { videoId, reason } = req.body;
    
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    video.isBanned = true;
    video.banReason = reason;
    video.moderatedBy = req.user._id;
    video.moderatedAt = new Date();
    await video.save();
    
    res.json({ message: 'Video başarıyla banlandı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Videonun banını kaldır
const unbanVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video bulunamadı' });
    }
    
    video.isBanned = false;
    video.banReason = '';
    video.moderatedBy = null;
    video.moderatedAt = null;
    await video.save();
    
    res.json({ message: 'Videonun banı kaldırıldı' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tüm banlanmış kullanıcıları getir
const getBannedUsers = async (req, res) => {
  try {
    const users = await User.find({ isBanned: true })
      .select('-password')
      .sort({ banDate: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tüm banlanmış videoları getir
const getBannedVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isBanned: true })
      .populate('user', 'name')
      .sort({ moderatedAt: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcının uyarılarını getir
const getUserWarnings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('warnings')
      .populate('warnings.moderator', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(user.warnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};