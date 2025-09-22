const axios = require('axios');

async function testServer() {
  try {
    console.log('Testing server health...');
    const response = await axios.get('http://localhost:8000/api/health');
    console.log('✅ Server is running:', response.data);
    
    console.log('\nTesting auth endpoint...');
    try {
      await axios.get('http://localhost:8000/api/auth/user');
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('✅ Auth endpoint is working (401 expected without token)');
      } else {
        console.log('❌ Unexpected auth error:', err.response?.status, err.response?.data);
      }
    }
    
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Make sure the server is running on port 8000');
    }
  }
}

testServer();