const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_earthtogether_app_2024';

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  console.log('POST /api/auth/register called - body:', req.body);
  const errors = validationResult(req);
   if (!errors.isEmpty()) {

    res.type('application/json');
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists', param: 'email' }] });
    }

    // Check if username is taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'Username already taken', param: 'username' }] });
    }

    // Create new user (password will be hashed by User model pre-save middleware)
    user = new User({
      username,
      email,
      password,
      joinedAt: new Date()
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            ecoPoints: user.ecoPoints,
            currentStreak: user.currentStreak
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.type('application/json');
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    console.log('Comparing password. Provided:', password, 'Stored hash:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Calculate achievements and contributions
    const Habit = require('../models/Habit');
    const Challenge = require('../models/Challenge');
    
    const habits = await Habit.find({ user: user._id });
    const challenges = await Challenge.find({ 'participants.user': user._id });
    
    // Calculate totals
    let totalEcoPoints = 0;
    let totalCarbonSaved = 0;
    let maxStreak = 0;
    
    habits.forEach(habit => {
      totalEcoPoints += habit.completions.length * habit.ecoPoints;
      totalCarbonSaved += habit.calculateCarbonSavings();
      if (habit.longestStreak > maxStreak) maxStreak = habit.longestStreak;
    });
    
    challenges.forEach(challenge => {
      const participant = challenge.participants.find(p => p.user.toString() === user._id.toString());
      if (participant && participant.completed) {
        totalEcoPoints += challenge.ecoPoints;
        totalCarbonSaved += challenge.carbonSaved;
      }
    });
    
    // Update user stats
    user.ecoPoints = totalEcoPoints;
    user.totalCarbonSaved = totalCarbonSaved;
    user.longestStreak = maxStreak;
    user.lastActive = new Date();
    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            ecoPoints: user.ecoPoints,
            currentStreak: user.currentStreak,
            totalCarbonSaved: user.totalCarbonSaved,
            badges: user.badges,
            certifications: user.certifications
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get authenticated user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// Dev-only debug route to list users (no passwords). Remove in production.
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug-users', async (req, res) => {
    try {
      const users = await User.find().select('-password -__v');
      res.json({ count: users.length, users });
    } catch (err) {
      console.error('Debug users error', err.message);
      res.status(500).send('Server error');
    }
  });

  // Dev-only: reset a user's password (local use only). This will use the
  // User model's pre-save middleware so the password is hashed correctly.
  // POST { email, newPassword }
  router.post('/reset-password-dev', [
    check('email', 'Please include a valid email').isEmail(),
    check('newPassword', 'Password must be 6 or more characters').isLength({ min: 6 })
  ], async (req, res) => {
    console.log('POST /api/auth/reset-password-dev called - body:', { email: req.body.email });
    const errors = validationResult(req);
     if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, newPassword } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }

      // Set new password and save so pre-save middleware hashes it
      user.password = newPassword;
      await user.save();

      res.json({ msg: 'Password reset successful for ' + email });
    } catch (err) {
      console.error('reset-password-dev error', err.message);
      res.status(500).send('Server error');
    }
  });
}
