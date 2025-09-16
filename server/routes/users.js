const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this 'uploads/' directory exists in your server root
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  const { username, bio } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ msg: 'Username already taken' });
      }
    }

    // Update fields
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/leaderboard
// @desc    Get global leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('username ecoPoints currentStreak totalCarbonSaved badges avatar')
      .sort({ ecoPoints: -1 })
      .limit(50);

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
