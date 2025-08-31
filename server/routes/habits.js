const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const User = require('../models/User');
const router = express.Router();

// @route   GET api/habits
// @desc    Get all habits for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('frequency', 'Frequency is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category, frequency, ecoPoints, carbonSaved } = req.body;

    const newHabit = new Habit({
      user: req.user.id,
      title,
      description,
      category,
      frequency,
      ecoPoints: ecoPoints || 10,
      carbonSaved: carbonSaved || 0.5
    });

    const habit = await newHabit.save();
    res.json(habit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/habits/:id
// @desc    Update a habit
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ msg: 'Habit not found' });
    }

    // Make sure user owns the habit
    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    habit = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(habit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/habits/:id
// @desc    Delete a habit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ msg: 'Habit not found' });
    }

    // Make sure user owns the habit
    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await habit.remove();
    res.json({ msg: 'Habit removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/habits/:id/complete
// @desc    Mark habit as completed
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ msg: 'Habit not found' });
    }

    // Make sure user owns the habit
    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Mark as completed
    const completion = await habit.markCompleted();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.ecoPoints += habit.ecoPoints;
    user.totalCarbonSaved += habit.carbonSaved;
    
    // Update streak logic
    const today = new Date().toDateString();
    const lastCompletion = habit.completions[habit.completions.length - 2];
    
    if (lastCompletion && new Date(lastCompletion.date).toDateString() === new Date(Date.now() - 24*60*60*1000).toDateString()) {
      user.currentStreak += 1;
    } else {
      user.currentStreak = 1;
    }
    
    await user.save();

    res.json({ habit, completion, userStats: { ecoPoints: user.ecoPoints, currentStreak: user.currentStreak } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
