const axios = require('axios');

async function testNews() {
  try {
    console.log('Testing news API...');
    const response = await axios.get('http://localhost:8000/api/news/gemini');
    console.log('✅ News API working:', response.data);
  } catch (error) {
    console.log('❌ News API failed:', error.response?.data || error.message);
  }
}

testNews();