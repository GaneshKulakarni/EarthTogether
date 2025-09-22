const axios = require('axios');

async function testAuth() {
  const baseURL = 'http://localhost:8000/api';
  
  try {
    // Test registration
    console.log('Testing registration...');
    const registerData = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    };
    
    const registerResponse = await axios.post(`${baseURL}/auth/register`, registerData);
    console.log('✅ Registration successful:', {
      token: registerResponse.data.token ? 'Present' : 'Missing',
      user: registerResponse.data.user ? 'Present' : 'Missing'
    });
    
    const token = registerResponse.data.token;
    
    // Test getting user with token
    console.log('\nTesting user fetch with token...');
    const userResponse = await axios.get(`${baseURL}/auth/user`, {
      headers: { 'x-auth-token': token }
    });
    console.log('✅ User fetch successful:', userResponse.data.username);
    
    // Test habits endpoint
    console.log('\nTesting habits endpoint...');
    const habitsResponse = await axios.get(`${baseURL}/habits`, {
      headers: { 'x-auth-token': token }
    });
    console.log('✅ Habits fetch successful:', habitsResponse.data.length, 'habits');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();