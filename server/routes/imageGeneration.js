const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post('/generate-image', auth, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ message: 'Google API key not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const response = await result.response;
    const imageData = response.candidates[0].content.parts[0];

    res.json({
      success: true,
      image: imageData,
      prompt: prompt
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate image',
      error: error.message 
    });
  }
});

module.exports = router;
