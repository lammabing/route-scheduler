const { Pool } = require('pg');

// Local PostgreSQL connection details
const localDbConfig = {
  connectionString: 'postgresql://postgres:postgres@localhost:5433/postgres'
};

const pool = new Pool(localDbConfig);

async function createAuthTables() {
  const client = await pool.connect();
  
  try {
    // Create user_roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID,
        role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (user_id, role)
      )
    `);
    
    console.log('user_roles table created successfully!');
    
    // Insert the existing admin user from Supabase
    await client.query(`
      INSERT INTO user_roles (id, user_id, role, created_at, updated_at) VALUES 
      ('6eb47867-356b-44a5-815c-cd662246e22e', 'f5aafdf1-c2c9-4992-9da2-7e521005b1ea', 'admin', '2025-05-13T07:26:49.684135+00:00', '2025-05-13T07:26:49.684135+00:00')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Admin user role inserted successfully!');
    
    // Create a function to update the updated_at field
    await client.query(`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create a trigger to update the updated_at field
    await client.query(`
      CREATE OR REPLACE TRIGGER update_user_roles_timestamp
      BEFORE UPDATE ON user_roles
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    `);
    
    console.log('Timestamp function and trigger created successfully!');
  } catch (error) {
    console.error('Error creating auth tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createAuthTables();