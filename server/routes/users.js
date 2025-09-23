const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/leaderboard
// @desc    Get leaderboard of all users sorted by points
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { sortBy = 'ecoPoints' } = req.query;
    
    let sortField = 'ecoPoints';
    if (sortBy === 'streaks') sortField = 'currentStreak';
    if (sortBy === 'impact') sortField = 'totalCarbonSaved';
    
    const users = await User.find({})
      .select('username ecoPoints currentStreak totalCarbonSaved')
      .sort({ [sortField]: -1 })
      .limit(100);
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;