const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/quizzes
// @desc    Get eco quizzes
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({ msg: 'Quizzes feature coming soon!' });
});

module.exports = router;
