const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/news
// @desc    Get eco news
// @access  Private
const NewsArticle = require('../models/NewsArticle');

router.get('/', auth, async (req, res) => {
  try {
    const articles = await NewsArticle.find().sort({ publishedAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/news
// @desc    Create a news article (Admin only)
// @access  Private
router.post('/', auth, async (req, res) => {
  // In a real application, you'd add admin role check here
  const { title, content, imageUrl, source, publishedAt, tags } = req.body;

  try {
    const newArticle = new NewsArticle({
      title,
      content,
      imageUrl,
      source,
      publishedAt: publishedAt || new Date(),
      tags: tags || []
    });

    const article = await newArticle.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
