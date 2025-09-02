const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/memes
// @desc    Get eco memes
// @access  Private
const Meme = require('../models/Meme');

// @route   GET api/memes
// @desc    Get all memes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 });
    res.json(memes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/memes/like/:id
// @desc    Like a meme
// @access  Private
router.post('/like/:id', auth, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);

    if (!meme) {
      return res.status(404).json({ msg: 'Meme not found' });
    }

    // Check if the meme has already been liked by this user
    if (meme.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Meme already liked' });
    }

    meme.likes.unshift(req.user.id);

    await meme.save();

    res.json(meme.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/memes
// @desc    Create a meme (Admin only - for future implementation)
// @access  Private
router.post('/', auth, async (req, res) => {
  // This route would typically be restricted to admin users
  // For now, anyone authenticated can create a meme for testing purposes
  const { title, description, imageUrl } = req.body;

  try {
    const newMeme = new Meme({
      title,
      description,
      imageUrl,
      user: req.user.id,
    });

    const meme = await newMeme.save();
    res.json(meme);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
