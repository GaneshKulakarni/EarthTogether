const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const router = express.Router();

// @route   GET api/challenges
// @desc    Get all active challenges
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ status: 'active' })
      .populate('participants.user', ['username', 'ecoPoints'])
      .sort({ startDate: -1 });
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/challenges
// @desc    Create a new challenge
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('duration', 'Duration is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      ecoPoints,
      carbonSaved,
      requirements,
      rewards
    } = req.body;

    const newChallenge = new Challenge({
      title,
      description,
      category,
      difficulty: difficulty || 'Medium',
      duration,
      ecoPoints: ecoPoints || 100,
      carbonSaved: carbonSaved || 10,
      requirements: requirements || [],
      rewards: rewards || [],
      createdBy: req.user.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
    });

    const challenge = await newChallenge.save();
    res.json(challenge);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/challenges/:id/join
// @desc    Join a challenge
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({ msg: 'Challenge is not active' });
    }

    // Check if user is already participating
    const isParticipating = challenge.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (isParticipating) {
      return res.status(400).json({ msg: 'Already participating in this challenge' });
    }

    challenge.participants.push({
      user: req.user.id,
      joinedAt: new Date(),
      progress: 0
    });

    await challenge.save();
    res.json(challenge);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/challenges/:id/submit
// @desc    Submit challenge progress
// @access  Private
router.post('/:id/submit', [
  auth,
  [check('progress', 'Progress is required').isNumeric()]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    // Check if user is participating
    const participant = challenge.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (!participant) {
      return res.status(400).json({ msg: 'Not participating in this challenge' });
    }

    // Update progress
    participant.progress = req.body.progress;
    participant.lastUpdated = new Date();

    // Check if challenge is completed
    if (participant.progress >= 100 && !participant.completed) {
      participant.completed = true;
      participant.completedAt = new Date();

      // Award points to user
      const user = await User.findById(req.user.id);
      user.ecoPoints += challenge.ecoPoints;
      user.totalCarbonSaved += challenge.carbonSaved;
      await user.save();
    }

    await challenge.save();
    res.json(challenge);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
