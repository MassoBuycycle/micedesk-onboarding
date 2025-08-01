const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testPolicyDefault() {
  try {
    console.log('Testing policy default functionality...');
    
    // Test creating a policy with default details
    const testPolicy = {
      system_hotel_id: 'TEST001',
      type: 'room_information',
      items: [
        {
          title: 'Test Policy Item',
          is_condition: false,
          details: [
            {
              name: 'Test Detail 1',
              description: 'This is a test detail',
              default: true
            },
            {
              name: 'Test Detail 2', 
              description: 'This is another test detail',
              default: false
            }
          ]
        }
      ]
    };

    console.log('Creating test policy...');
    const createResponse = await axios.post(`${API_BASE_URL}/information-policies`, testPolicy);
    console.log('Create response:', createResponse.data);

    // Test fetching the policy to verify default field is included
    console.log('Fetching policies for hotel...');
    const fetchResponse = await axios.get(`${API_BASE_URL}/information-policies/hotel/TEST001`);
    console.log('Fetch response:', JSON.stringify(fetchResponse.data, null, 2));

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testPolicyDefault(); 