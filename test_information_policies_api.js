// Test script for Information Policies API
// Run this with: node test_information_policies_api.js

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testPolicy = {
  hotel_id: 'TEST123',
  type: 'room_information',
  items: [
    {
      title: 'Check-in Requirements',
      is_condition: true,
      details: [
        {
          name: 'Valid ID Required',
          description: 'Guests must present a valid government-issued photo ID at check-in'
        },
        {
          name: 'Credit Card Authorization',
          description: 'A credit card is required for incidental charges'
        }
      ]
    },
    {
      title: 'Room Amenities',
      is_condition: false,
      details: [
        {
          name: 'Free WiFi',
          description: 'Complimentary high-speed internet access in all rooms'
        }
      ]
    }
  ]
};

async function testAPI() {
  try {
    console.log('🧪 Testing Information Policies API...\n');

    // Test 1: Create Information Policy
    console.log('1. Creating information policy...');
    const createResponse = await fetch(`${API_BASE_URL}/information-policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPolicy)
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createResult = await createResponse.json();
    console.log('✅ Policy created:', createResult);
    const policyId = createResult.data.id;

    // Test 2: Get Information Policies by Hotel
    console.log('\n2. Getting policies by hotel...');
    const getByHotelResponse = await fetch(`${API_BASE_URL}/information-policies/hotel/${testPolicy.hotel_id}`);
    
    if (!getByHotelResponse.ok) {
      throw new Error(`Get by hotel failed: ${getByHotelResponse.status} ${getByHotelResponse.statusText}`);
    }

    const hotelPolicies = await getByHotelResponse.json();
    console.log('✅ Hotel policies:', JSON.stringify(hotelPolicies, null, 2));

    // Test 3: Get Information Policies by Type
    console.log('\n3. Getting policies by type...');
    const getByTypeResponse = await fetch(`${API_BASE_URL}/information-policies/hotel/${testPolicy.hotel_id}/type/${testPolicy.type}`);
    
    if (!getByTypeResponse.ok) {
      throw new Error(`Get by type failed: ${getByTypeResponse.status} ${getByTypeResponse.statusText}`);
    }

    const typePolicies = await getByTypeResponse.json();
    console.log('✅ Type policies:', JSON.stringify(typePolicies, null, 2));

    // Test 4: Update Information Policy
    console.log('\n4. Updating policy...');
    const updateData = {
      items: [
        {
          title: 'Updated Check-in Requirements',
          is_condition: true,
          details: [
            {
              name: 'Updated ID Requirement',
              description: 'Updated: Guests must present a valid government-issued photo ID at check-in'
            }
          ]
        }
      ]
    };

    const updateResponse = await fetch(`${API_BASE_URL}/information-policies/${policyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status} ${updateResponse.statusText}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Policy updated:', updateResult);

    // Test 5: Delete Information Policy
    console.log('\n5. Deleting policy...');
    const deleteResponse = await fetch(`${API_BASE_URL}/information-policies/${policyId}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      throw new Error(`Delete failed: ${deleteResponse.status} ${deleteResponse.statusText}`);
    }

    const deleteResult = await deleteResponse.json();
    console.log('✅ Policy deleted:', deleteResult);

    console.log('\n🎉 All tests passed! Information Policies API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the tests
testAPI(); 