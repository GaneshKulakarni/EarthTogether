const axios = require('axios');

async function testCreatePost() {
  try {
    // First register a user to get a token
    console.log('Registering test user...');
    const registerResponse = await axios.post('http://localhost:8000/api/auth/register', {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered, token received');
    
    // Now try to create a post
    console.log('Creating test post...');
    const postResponse = await axios.post('http://localhost:8000/api/posts', {
      content: 'This is a test post from the API!',
      category: 'General'
    }, {
      headers: {
        'x-auth-token': token
      }
    });
    
    console.log('✅ Post created successfully:', postResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testCreatePost();