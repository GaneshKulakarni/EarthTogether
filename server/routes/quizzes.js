const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/quizzes
// @desc    Get eco quizzes
// @access  Private
const Quiz = require('../models/Quiz');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   GET api/quizzes
// @desc    Get AI generated quizzes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate 5 environmental quiz questions with 4 options each. Format as JSON array:
    [{
      "question": "Clear environmental question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option"
    }]
    Topics: climate change, renewable energy, recycling, biodiversity, sustainability, pollution, conservation. Make questions educational and engaging.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json\n?|```\n?/g, '').trim();
    
    let quizzes = [];
    try {
      quizzes = JSON.parse(text);
      console.log('Generated quizzes:', quizzes.length, 'questions');
    } catch (parseError) {
      console.log('Quiz parse error, using fallback');
      quizzes = [
        {
          question: "What percentage of plastic waste is recycled globally?",
          options: ["9%", "25%", "50%", "75%"],
          correctAnswer: "9%"
        },
        {
          question: "Which renewable energy source is fastest growing?",
          options: ["Solar", "Wind", "Hydro", "Geothermal"],
          correctAnswer: "Solar"
        }
      ];
    }
    
    res.json(quizzes);
  } catch (err) {
    console.error('Quiz generation error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/quizzes/flashcards
// @desc    Get AI generated flashcards
// @access  Private
router.get('/flashcards', auth, async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate 6 environmental education flashcards. Format as JSON array:
    [{
      "question": "Environmental term, concept, or 'What is...' question",
      "answer": "Clear, concise educational explanation (2-3 sentences max)"
    }]
    Cover: carbon footprint, biodiversity, renewable energy, sustainability, greenhouse effect, ecosystem, pollution, conservation, etc. Make answers informative but brief.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json\n?|```\n?/g, '').trim();
    
    let flashcards = [];
    try {
      flashcards = JSON.parse(text);
      console.log('Generated flashcards:', flashcards.length, 'cards');
    } catch (parseError) {
      console.log('Flashcard parse error, using fallback');
      flashcards = [
        {
          question: "What is carbon footprint?",
          answer: "The total amount of greenhouse gases produced by human activities, measured in CO2 equivalents."
        },
        {
          question: "What is renewable energy?",
          answer: "Energy from sources that naturally replenish, like solar, wind, and hydro power."
        }
      ];
    }
    
    res.json(flashcards);
  } catch (err) {
    console.error('Flashcard generation error:', err.message);
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
