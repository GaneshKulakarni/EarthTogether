const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/memes
// @desc    Get eco memes
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({ msg: 'Memes feature coming soon!' });
});

module.exports = router;
