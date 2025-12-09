const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// @route   GET api/research
// @desc    Get AI generated research articles
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (!genAI) {
      // Return fallback data if GEMINI_API_KEY is not configured
      return res.json([
        {
          id: 1,
          title: "Impact of Renewable Energy on Global Carbon Emissions",
          summary: "Comprehensive analysis shows renewable energy adoption has reduced global CO2 emissions by 15% over the past decade.",
          category: "energy",
          author: "Dr. Sarah Chen",
          date: "2024-01-15",
          readTime: "8 min read",
          tags: ["renewable energy", "carbon emissions", "climate change"]
        }
      ]);
    }
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate 5 environmental research articles. Format as JSON array:
    [{
      "id": 1,
      "title": "Research article title",
      "summary": "Detailed 3-4 sentence summary of research findings",
      "category": "energy|pollution|urban|agriculture|climate",
      "author": "Researcher/Institution name",
      "date": "2024-01-XX",
      "readTime": "X min read",
      "tags": ["tag1", "tag2", "tag3"]
    }]
    Topics: renewable energy, climate change, biodiversity, pollution, sustainable agriculture, urban planning. Make them sound scientific and current.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json\n?|```\n?/g, '').trim();
    
    let research = [];
    try {
      research = JSON.parse(text);
      console.log('Generated research:', research.length, 'articles');
    } catch (parseError) {
      console.log('Research parse error, using fallback');
      research = [
        {
          id: 1,
          title: "Impact of Renewable Energy on Global Carbon Emissions",
          summary: "Comprehensive analysis shows renewable energy adoption has reduced global CO2 emissions by 15% over the past decade.",
          category: "energy",
          author: "Dr. Sarah Chen",
          date: "2024-01-15",
          readTime: "8 min read",
          tags: ["renewable energy", "carbon emissions", "climate change"]
        }
      ];
    }
    
    res.json(research);
  } catch (err) {
    console.error('Research generation error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;