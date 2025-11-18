const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Eğlence', 'Oyun', 'Müzik', 'Spor', 'Eğitim', 'Diğer']
  },
  tags: [{
    type: String,
    trim: true
  }],
  filename: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  showLikes: {
    type: Boolean,
    default: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: ''
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [commentSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ uploader: 1 });
videoSchema.index({ category: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ 'likes.user': 1 });
videoSchema.index({ 'dislikes.user': 1 });

// Virtual for like count
videoSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
videoSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;

});

// Virtual for comment count
videoSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for engagement score (likes - dislikes + comments)
videoSchema.virtual('engagementScore').get(function() {
  return this.likes.length - this.dislikes.length + this.comments.length;
});

// Ensure virtual fields are serialized
videoSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Video', videoSchema);