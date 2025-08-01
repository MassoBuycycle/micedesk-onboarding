import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test without auth token
    console.log('Testing without auth token...');
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels`);
      console.log('Response without auth:', response.status);
    } catch (error) {
      console.log('Expected error without auth:', error.response?.status, error.response?.data);
    }
    
    // Test with invalid auth token
    console.log('Testing with invalid auth token...');
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('Response with invalid auth:', response.status);
    } catch (error) {
      console.log('Expected error with invalid auth:', error.response?.status, error.response?.data);
    }
    
    console.log('Auth test completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth(); 