const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Current environmental news data
const mockNews = [
  {
    headline: "COP29 Climate Summit Reaches Historic $300 Billion Deal",
    summary: "World leaders at COP29 in Baku agreed to provide $300 billion annually by 2035 to help developing nations combat climate change. The deal marks a significant step forward in global climate finance.",
    source: "Reuters Climate"
  },
  {
    headline: "Antarctic Ice Sheet Melting Accelerates to Critical Levels",
    summary: "New satellite data reveals Antarctic ice loss has tripled in the past decade. Scientists warn of irreversible tipping points that could raise sea levels by several meters.",
    source: "Nature Climate Change"
  },
  {
    headline: "Solar Power Becomes Cheapest Energy Source in History",
    summary: "Solar photovoltaic costs have dropped 90% since 2010, making it the most affordable electricity source globally. This milestone accelerates the transition away from fossil fuels.",
    source: "International Energy Agency"
  },
  {
    headline: "Amazon Rainforest Deforestation Drops 30% in 2024",
    summary: "Brazil reports significant reduction in Amazon deforestation following enhanced monitoring and enforcement. Conservation efforts show promising results for biodiversity protection.",
    source: "Environmental Protection Agency"
  },
  {
    headline: "Microplastics Found in Human Blood Raise Health Concerns",
    summary: "Scientists detect microplastic particles in human bloodstream for the first time. Research suggests potential health impacts from widespread plastic pollution in food chain.",
    source: "Science Journal"
  },
  {
    headline: "Green Hydrogen Production Reaches Commercial Viability",
    summary: "Major breakthrough in green hydrogen technology makes clean fuel economically competitive. Industry experts predict rapid scaling for carbon-neutral transportation and industry.",
    source: "Clean Energy Wire"
  },
  {
    headline: "Coral Reef Restoration Shows 60% Recovery Success Rate",
    summary: "Innovative coral restoration techniques demonstrate remarkable recovery in damaged reef systems. Marine biologists report significant biodiversity improvements in restored areas.",
    source: "Marine Conservation Society"
  },
  {
    headline: "Electric Aircraft Completes First Commercial Flight",
    summary: "World's first electric passenger aircraft successfully completes commercial route, marking milestone for sustainable aviation. Technology promises zero-emission short-haul flights.",
    source: "Aviation Environment"
  }
];

// Get environment news
exports.getEnvironmentNews = async (req, res) => {
  console.log('Received request for environment news');
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate 6 current environmental news headlines with summaries. Format as JSON array:
    [{
      "headline": "News headline about current environmental topic",
      "summary": "Brief 2-3 sentence summary with specific details",
      "source": "Credible news source name"
    }]
    Focus on: climate change, renewable energy, conservation, sustainability, pollution, biodiversity. Make them realistic and current.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean the response
    text = text.replace(/```json\n?|```\n?/g, '').trim();
    
    try {
      const newsData = JSON.parse(text);
      console.log('Generated news data:', newsData.length, 'articles');
      return res.json(newsData);
    } catch (parseError) {
      console.log('JSON parse error, using fallback news data');
      return res.json(mockNews);
    }
    
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return res.json(mockNews);
  }
};
