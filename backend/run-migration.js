import pool from './src/db/config.js';

async function runMigration() {
  try {
    console.log('Running migration for room category images file type...');
    
    const [result] = await pool.query(`
      INSERT INTO file_types (name, code, category, allowed_extensions, max_size)
      VALUES ('Room Category Images', 'images', 'room-category-images', '["jpg", "jpeg", "png", "webp"]', 5242880)
      ON DUPLICATE KEY UPDATE id = id
    `);
    
    console.log('Migration completed successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 