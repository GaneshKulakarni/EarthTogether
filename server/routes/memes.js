const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/memes
// @desc    Get eco memes
// @access  Private
const Meme = require('../models/Meme');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   GET api/memes
// @desc    Get AI generated eco memes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate 6 funny environmental memes with titles and captions. Format as JSON array:
    [{
      "title": "Catchy meme title",
      "description": "Funny environmental caption or joke with emojis",
      "imageUrl": "https://via.placeholder.com/400x300?text=Eco+Meme"
    }]
    Topics: recycling fails, climate change, solar power, electric cars, plastic pollution, green living. Make them relatable and humorous but eco-positive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json\n?|```\n?/g, '').trim();
    
    let aiMemes = [];
    try {
      aiMemes = JSON.parse(text);
      console.log('Generated memes:', aiMemes.length, 'memes');
    } catch (parseError) {
      console.log('Meme parse error, using fallback');
      aiMemes = [
        {
          title: "Reusable Bag Victory",
          description: "When you actually remember your reusable bags at the store 🎆🛍️",
          imageUrl: "https://via.placeholder.com/400x300?text=Eco+Win"
        },
        {
          title: "Solar Panel Flex",
          description: "My electricity bill: $12. My neighbor's: $200. Solar panels go brrr ☀️💰",
          imageUrl: "https://via.placeholder.com/400x300?text=Solar+Power"
        }
      ];
    }
    
    // Add random engagement stats
    aiMemes = aiMemes.map(meme => ({
      ...meme,
      _id: Math.random().toString(36).substr(2, 9),
      likes: Math.floor(Math.random() * 200) + 10,
      comments: Math.floor(Math.random() * 50) + 2
    }));
    
    res.json(aiMemes);
  } catch (err) {
    console.error('Meme generation error:', err.message);
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
