const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    default: 'general'
  },
  category: {
    type: String,
    default: 'General'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    default: 'active'
  }
}, {
  timestamps: true
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.likes.some(like => like.user.toString() === userId)) {
    this.likes.push({ user: userId });
  }
  return this.save();
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId);
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content
  });
  return this.save();
};

// Method to add share
postSchema.methods.addShare = function(userId) {
  this.shares.push({ user: userId });
  return this.save();
};

// Method to increment view count
postSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Index for efficient queries
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
