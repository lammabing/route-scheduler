const { Pool } = require('pg');

// Local PostgreSQL connection details
const localDbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5433,
};

// Create a connection pool
const pool = new Pool(localDbConfig);

async function testDb() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful!', result.rows[0]);
    
    // Test routes table
    const routesResult = await pool.query('SELECT * FROM routes LIMIT 1');
    console.log('Routes table test:', routesResult.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testDb();