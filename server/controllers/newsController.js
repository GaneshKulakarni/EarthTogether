// Mock news data for development
const mockNews = [
  {
    headline: "Global Renewable Energy Capacity Reaches Record High",
    summary: "International renewable energy capacity increased by 15% this year. Solar and wind power led the growth with significant investments worldwide.",
    source: "Environmental News Network"
  },
  {
    headline: "Ocean Cleanup Project Removes 100,000 Pounds of Plastic",
    summary: "The latest ocean cleanup initiative successfully removed massive amounts of plastic waste. The project aims to clean 90% of floating ocean plastic by 2040.",
    source: "Ocean Conservation Today"
  },
  {
    headline: "Electric Vehicle Sales Surge 40% Globally",
    summary: "Electric vehicle adoption accelerated significantly this quarter. Major automakers report record-breaking sales and expanded charging infrastructure.",
    source: "Green Transport Weekly"
  }
];

// Get environment news
exports.getEnvironmentNews = async (req, res) => {
  console.log('Received request for environment news');
  
  try {
    // Return mock news data
    return res.json(mockNews);
    
  } catch (error) {
    console.error('Error in getEnvironmentNews:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error fetching environment news',
      error: error.message
    });
  }
};
