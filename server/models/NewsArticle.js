const mongoose = require('mongoose');

const NewsArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  imageUrl: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'EcoConnect'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  tags: [
    {
      type: String
    }
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsArticle', NewsArticleSchema);