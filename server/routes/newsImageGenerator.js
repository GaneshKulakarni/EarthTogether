const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

const router = express.Router();

const newsPrompts = {
  'cop29-climate-summit': 'Professional photograph of a climate summit conference with world leaders, modern conference hall, green energy theme, high quality, 4k',
  'antarctic-ice': 'Aerial view of Antarctic ice sheets melting, glaciers breaking apart, climate change impact, dramatic lighting, high resolution',
  'ocean-plastic': 'Underwater photograph showing ocean plastic pollution, marine life affected, environmental crisis, documentary style',
  'solar-panels': 'Modern solar panel farm in green landscape, renewable energy installation, sustainable technology, bright sunlight, professional',
  'forest-recovery': 'Lush green forest with tall trees, reforestation efforts, biodiversity, natural landscape, sunlight through canopy',
  'sewage-treatment': 'Advanced sewage treatment facility with modern technology, water purification systems, environmental engineering'
};

router.post('/generate-news-image', auth, async (req, res) => {
  try {
    const { newsKey, headline } = req.body;

    if (!newsKey) {
      return res.status(400).json({ message: 'newsKey is required' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY not configured');
      return res.status(500).json({ message: 'Google API key not configured' });
    }

    const prompt = newsPrompts[newsKey] || `Professional environmental photograph: ${headline}`;
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Generate a realistic, high-quality image for this news article: "${headline}". ${prompt}`
              }
            ]
          }
        ]
      });

      const response = await result.response;
      const text = response.text();

      res.json({
        success: true,
        image: text,
        newsKey: newsKey
      });
    } catch (apiError) {
      console.error('Gemini API Error:', apiError.message);
      
      // Fallback to Unsplash if Gemini fails
      const fallbackImages = {
        'cop29-climate-summit': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
        'antarctic-ice': 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=500&fit=crop',
        'ocean-plastic': 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=800&h=500&fit=crop',
        'solar-panels': 'https://images.unsplash.com/photo-1497440871519-89386e6b136d?w=800&h=500&fit=crop',
        'forest-recovery': 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=500&fit=crop',
        'sewage-treatment': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=500&fit=crop'
      };

      res.json({
        success: true,
        image: fallbackImages[newsKey] || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop',
        newsKey: newsKey,
        fallback: true
      });
    }
  } catch (error) {
    console.error('News image generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate news image',
      error: error.message 
    });
  }
});

module.exports = router;
