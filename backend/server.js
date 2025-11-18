const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('./middleware/cors');
require('dotenv').config();

const app = express();

// CORS middleware
app.use(cors);

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 30 * 60 * 1000 } // 30 dakika
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/video/videoRoutes');
const moderationRoutes = require('./routes/ModerationRoutes');

// Database bağlantısı
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/moderation', moderationRoutes);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});