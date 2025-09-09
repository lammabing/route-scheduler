import { localDb } from './src/lib/local-db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await localDb.query('SELECT * FROM routes LIMIT 1');
    console.log('Connection successful!');
    console.log('Sample route:', result.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await localDb.end();
  }
}

testConnection();