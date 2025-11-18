const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  createAdminUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/admin', protect, createAdminUser);

// Matematik işlemli CAPTCHA için yeni endpoint
router.get('/math-captcha', (req, res) => {
  // Rastgele iki sayı üret (1-20 arasında)
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  
  // Toplama işlemi
  const operation = '+';
  const question = `${num1} ${operation} ${num2} = ?`;
  const answer = num1 + num2;
  
  // Cevabı session'da sakla (geliştirme için)
  // Production'da Redis veya başka bir cache sistemi kullanılmalı
  req.session.mathCaptcha = answer;
  
  res.json({
    question: question,
    message: 'Lütfen bu matematik işlemini çözün'
  });
});

module.exports = router;