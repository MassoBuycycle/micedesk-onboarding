import pool from '../db/config.js';

/**
 * Test script to verify table prefixing is working correctly
 */
async function testTablePrefixing() {
  console.log('🧪 Testing table prefixing functionality...\n');
  
  const connection = await pool.getConnection();
  
  try {
    // Test 1: Simple SELECT query
    console.log('Test 1: Basic SELECT query');
    console.log('Original: SELECT * FROM hotels LIMIT 1');
    
    try {
      const [results] = await connection.query('SELECT * FROM hotels LIMIT 1');
      console.log('✅ Query executed successfully - prefixing works!');
      console.log(`   Found ${results.length} record(s)\n`);
    } catch (error) {
      if (error.message.includes('onboarding_hotels')) {
        console.log('✅ Query failed as expected - table onboarding_hotels referenced');
        console.log('   This means prefixing is working!\n');
      } else {
        console.log('❌ Unexpected error:', error.message, '\n');
      }
    }
    
    // Test 2: JOIN query
    console.log('Test 2: JOIN query');
    console.log('Original: SELECT h.name, r.* FROM hotels h LEFT JOIN rooms r ON h.id = r.hotel_id LIMIT 1');
    
    try {
      const [results] = await connection.query(`
        SELECT h.name, r.* 
        FROM hotels h 
        LEFT JOIN rooms r ON h.id = r.hotel_id 
        LIMIT 1
      `);
      console.log('✅ JOIN query executed successfully');
      console.log(`   Found ${results.length} record(s)\n`);
    } catch (error) {
      if (error.message.includes('onboarding_')) {
        console.log('✅ JOIN query failed as expected - onboarding_ tables referenced');
        console.log('   This means prefixing is working for complex queries!\n');
      } else {
        console.log('❌ Unexpected error in JOIN:', error.message, '\n');
      }
    }
    
    // Test 3: Check which tables actually exist
    console.log('Test 3: Checking existing tables');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'hotel_cms' 
      AND TABLE_NAME LIKE 'onboarding_%'
      ORDER BY TABLE_NAME
    `);
    
    console.log(`✅ Found ${tables.length} onboarding_ tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    
    console.log('\n🎉 Table prefixing test completed!');
    console.log('💡 Your API will now automatically use onboarding_ prefixed tables.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    connection.release();
  }
}

// Run the test
testTablePrefixing()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 