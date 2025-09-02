const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/quizzes
// @desc    Get eco quizzes
// @access  Private
const Quiz = require('../models/Quiz');

// @route   GET api/quizzes
// @desc    Get all quizzes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/quizzes
// @desc    Create a quiz (Admin only - for future implementation)
// @access  Private
router.post('/', auth, async (req, res) => {
  // This route would typically be restricted to admin users
  // For now, anyone authenticated can create a quiz for testing purposes
  const { question, options, correctAnswer, ecoPoints } = req.body;

  try {
    const newQuiz = new Quiz({
      question,
      options,
      correctAnswer,
      ecoPoints,
      user: req.user.id,
    });

    const quiz = await newQuiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
