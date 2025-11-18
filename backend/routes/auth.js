const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Kullanıcı kayıt ol
router.post('/register', registerUser);

// Kullanıcı giriş yap
router.post('/login', loginUser);

// Kullanıcı profili (korumalı)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

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