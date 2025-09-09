const { localDb } = require('../src/lib/local-db');

async function testDb() {
  try {
    console.log('Testing database connection...');
    const result = await localDb.query('SELECT NOW()');
    console.log('Database connection successful!', result.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testDb();