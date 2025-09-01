const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

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
      process.env.JWT_SECRET || 'fallback_secret',
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
  console.log('POST /api/auth/login called - body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.type('application/json');
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
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
