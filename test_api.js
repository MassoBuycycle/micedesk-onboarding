const fetch = require('node-fetch');

async function testAdditionalLinks() {
  console.log('Testing additional_links API functionality...');
  
  try {
    // Test 1: Create a hotel with additional links
    console.log('\n1. Testing hotel creation with additional links...');
    const createResponse = await fetch('http://localhost:3001/api/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Hotel with Links',
        system_hotel_id: 'TEST123',
        additional_links: [
          { name: 'Documentation', link: 'https://docs.example.com' },
          { name: 'GitHub', link: 'https://github.com/example' }
        ]
      })
    });
    
    console.log('Create Response Status:', createResponse.status);
    const createData = await createResponse.text();
    console.log('Create Response:', createData);
    
    // Test 2: Get all hotels to see if additional_links are parsed correctly
    console.log('\n2. Testing hotel retrieval...');
    const getResponse = await fetch('http://localhost:3001/api/hotels');
    console.log('Get Response Status:', getResponse.status);
    const getData = await getResponse.text();
    console.log('Get Response:', getData);
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAdditionalLinks(); 