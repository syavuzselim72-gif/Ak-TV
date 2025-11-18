const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

// JWT token oluştur
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Kayıt ol
const registerUser = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password, mathCaptchaAnswer } = req.body;
    
    // Matematik CAPTCHA doğrulaması
    if (!mathCaptchaAnswer) {
      return res.status(400).json({ message: 'Lütfen matematik işlemini çözün' });
    }
    
    // Oturumdaki cevapla karşılaştır
    if (parseInt(mathCaptchaAnswer) !== req.session.mathCaptcha) {
      return res.status(400).json({ message: 'Matematik işlemi yanlış' });
    }
    
    // Alanların dolu olduğunu kontrol et
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun' });
    }
    
    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }
    
    // Kullanıcının zaten var olup olmadığını kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
    }
    
    // Admin kullanıcı mı kontrol et
    const isAdminUser = email === 'yavuzselim.sezgin@example.com' || email === 'admin@example.com';
    
    // Kullanıcı oluştur
    const user = new User({
      name,
      email,
      password,
      isAdmin: isAdminUser
    });
    
    // İçerik denetimi ve kaydetme
    await user.save();
    
    // Oturumdaki CAPTCHA cevabını temizle
    delete req.session.mathCaptcha;
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        description: user.description,
        socialLinks: user.socialLinks,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı verisi' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Giriş yap
const loginUser = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password, mathCaptchaAnswer } = req.body;
    
    // Matematik CAPTCHA doğrulaması
    if (!mathCaptchaAnswer) {
      return res.status(400).json({ message: 'Lütfen matematik işlemini çözün' });
    }
    
    // Oturumdaki cevapla karşılaştır
    console.log('Session CAPTCHA:', req.session.mathCaptcha);
    console.log('User CAPTCHA answer:', mathCaptchaAnswer);
    if (parseInt(mathCaptchaAnswer) !== req.session.mathCaptcha) {
      return res.status(400).json({ message: 'Matematik işlemi yanlış' });
    }
    
    // Alanların dolu olduğunu kontrol et
    if (!email || !password) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun' });
    }
    
    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email });
    console.log('User found:', user);
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    
    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    
    // Oturumdaki CAPTCHA cevabını temizle
    delete req.session.mathCaptcha;
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      description: user.description,
      socialLinks: user.socialLinks,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı profilini getir
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        description: user.description,
        socialLinks: user.socialLinks,
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcı profilini güncelle
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.description = req.body.description || user.description;
      
      if (req.body.socialLinks) {
        user.socialLinks = {
          website: req.body.socialLinks.website || user.socialLinks.website,
          twitter: req.body.socialLinks.twitter || user.socialLinks.twitter,
          instagram: req.body.socialLinks.instagram || user.socialLinks.instagram,
          youtube: req.body.socialLinks.youtube || user.socialLinks.youtube
        };
      }

      // İçerik denetimi ve kaydetme
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        description: updatedUser.description,
        socialLinks: updatedUser.socialLinks,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create admin user
const createAdminUser = async (req, res) => {
  try {
    // Check if user is already admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Yetkilendirme hatası' });
    }

    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun' });
    }

    // Check if password is long enough
    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda' });
    }

    // Create admin user
    const user = new User({
      name,
      email,
      password,
      isAdmin: true
    });

    await user.save();

    res.status(201).json({
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  generateToken,
  createAdminUser
};