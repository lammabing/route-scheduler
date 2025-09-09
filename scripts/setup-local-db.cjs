const { Client } = require('pg');
require('dotenv').config();

// PostgreSQL connection details for default database (usually 'postgres')
const defaultDbConfig = {
  user: process.env.LOCAL_DB_USER || 'postgres',
  host: process.env.LOCAL_DB_HOST || 'localhost',
  database: 'postgres', // Connect to default database first
  port: process.env.LOCAL_DB_PORT || 5432,
};

// Add password only if it's not empty
if (process.env.LOCAL_DB_PASSWORD && process.env.LOCAL_DB_PASSWORD.trim() !== '') {
  defaultDbConfig.password = process.env.LOCAL_DB_PASSWORD;
}

// Target database name
const targetDatabase = process.env.LOCAL_DB_NAME || 'route_schedule_sync';

async function setupLocalDatabase() {
  let client;
  
  try {
    console.log('Connecting to PostgreSQL server...');
    client = new Client(defaultDbConfig);
    await client.connect();
    console.log('✓ Connected to PostgreSQL server');
    
    // Check if database exists
    console.log(`\nChecking if database '${targetDatabase}' exists...`);
    const dbCheckResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );
    
    if (dbCheckResult.rowCount === 0) {
      console.log(`Database '${targetDatabase}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE ${targetDatabase}`);
      console.log(`✓ Database '${targetDatabase}' created successfully`);
    } else {
      console.log(`Database '${targetDatabase}' already exists`);
    }
    
    // Close connection to default database
    await client.end();
    
    // Connect to the target database to check extensions
    console.log(`\nConnecting to database '${targetDatabase}'...`);
    const targetDbConfig = { ...defaultDbConfig, database: targetDatabase };
    client = new Client(targetDbConfig);
    await client.connect();
    console.log(`✓ Connected to database '${targetDatabase}'`);
    
    // Enable required extensions
    console.log('\nEnabling required extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✓ UUID extension enabled');
    
    await client.end();
    console.log('\n✓ Local database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
    
    process.exit(1);
  }
}

setupLocalDatabase();