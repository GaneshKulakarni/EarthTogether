const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
  console.log('Please set GEMINI_API_KEY in your .env file');
  console.log('You can get an API key from: https://aistudio.google.com/app/apikey');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Get environment news
exports.getEnvironmentNews = async (req, res) => {
  console.log('Received request for environment news');
  
  if (!genAI) {
    const errorMsg = 'Gemini API key not configured';
    console.error(errorMsg);
    return res.status(500).json({
      success: false,
      message: errorMsg,
      error: 'Server configuration error: Missing API key'
    });
  }

  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Provide a list of the latest 5 environment and sustainability news items. 
      For each item, include:
      1. A brief headline (max 15 words)
      2. A 2-3 sentence summary
      3. The source name (if available)
      
      Format the response as a JSON array of objects with these fields:
      [
        {
          "headline": "...",
          "summary": "...",
          "source": "..."
        }
      ]
      
      Only return the JSON array, nothing else.`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);
    
    // Clean the response
    let cleanedText = text.trim();
    
    // Remove markdown code block markers if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?|\n```$/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?|\n```$/g, '');
    }
    
    console.log('Cleaned response:', cleanedText);
    
    try {
      const news = JSON.parse(cleanedText);
      console.log('Successfully parsed news:', news);
      
      if (!Array.isArray(news)) {
        throw new Error('Expected an array of news items');
      }
      
      return res.json({
        success: true,
        data: news
      });
      
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Problematic response text:', cleanedText);
      
      // Try to extract JSON from the response
      try {
        const jsonMatch = cleanedText.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          const news = JSON.parse(jsonMatch[0]);
          return res.json({
            success: true,
            data: Array.isArray(news) ? news : [news]
          });
        }
      } catch (e) {
        console.error('Failed to extract JSON from response:', e);
      }
      
      // If we get here, we couldn't parse the response
      return res.status(500).json({
        success: false,
        message: 'Error parsing Gemini response',
        error: parseError.message,
        rawResponse: cleanedText
      });
    }
    
  } catch (error) {
    console.error('Error in getEnvironmentNews:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error fetching environment news',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
