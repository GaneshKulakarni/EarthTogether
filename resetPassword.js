const axios = require('axios');

async function resetPassword() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/reset-password-dev', {
      email: 'sureshyadhav@gmail.com',
      newPassword: 'suresh123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Password reset successful:', response.data);
  } catch (error) {
    console.error('Password reset failed:', error.response ? error.response.data : error.message);
  }
}

resetPassword();