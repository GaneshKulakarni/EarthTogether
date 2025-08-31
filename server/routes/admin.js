const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Habit = require('../models/Habit');
const Post = require('../models/Post');
const Challenge = require('../models/Challenge');
const router = express.Router();

// @route   GET api/admin
// @desc    Admin panel
// @access  Private
router.get('/', auth, (req, res) => {
  res.json({ msg: 'Admin panel coming soon!' });
});

// @route   GET api/admin/test
// @desc    Test endpoint (no auth required)
// @access  Public
router.get('/test', (req, res) => {
  res.json({ msg: 'Admin route is working!', timestamp: new Date().toISOString() });
});

// @route   GET api/admin/users-public
// @desc    View all users in database (no auth required for debugging)
// @access  Public
router.get('/users-public', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      count: users.length,
      users: users,
      message: 'Users retrieved successfully (public endpoint)'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/users
// @desc    View all users in database
// @access  Private
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      count: users.length,
      users: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/database-stats
// @desc    Get database statistics
// @access  Private
router.get('/database-stats', auth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const habitCount = await Habit.countDocuments();
    const postCount = await Post.countDocuments();
    const challengeCount = await Challenge.countDocuments();

    res.json({
      database: 'earthtogether',
      collections: {
        users: userCount,
        habits: habitCount,
        posts: postCount,
        challenges: challengeCount
      },
      totalDocuments: userCount + habitCount + postCount + challengeCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
