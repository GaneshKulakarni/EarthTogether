const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/news
// @desc    Get eco news
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({ msg: 'News feature coming soon!' });
});

module.exports = router;
