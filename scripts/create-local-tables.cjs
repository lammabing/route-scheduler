const { Pool } = require('pg');

// Local PostgreSQL connection details
const localDbConfig = {
  connectionString: 'postgresql://postgres:postgres@localhost:5433/postgres'
};

const pool = new Pool(localDbConfig);

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Create time_infos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_infos (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        description TEXT
      )
    `);
    
    // Create public_holidays table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public_holidays (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create departure_times table
    await client.query(`
      CREATE TABLE IF NOT EXISTS departure_times (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID NOT NULL,
        time TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create fares table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID NOT NULL,
        name TEXT NOT NULL,
        fare_type TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        currency TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create departure_time_infos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS departure_time_infos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        departure_time_id UUID NOT NULL,
        time_info_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create departure_time_fares table
    await client.query(`
      CREATE TABLE IF NOT EXISTS departure_time_fares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        departure_time_id UUID NOT NULL,
        fare_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Insert mock data for time_infos
    await client.query(`
      INSERT INTO time_infos (id, symbol, description) VALUES 
      ('a', 'a', 'Service operates only during school terms'),
      ('b', 'b', 'Service extends to Central Station'),
      ('c', 'c', 'Wheelchair accessible service'),
      ('d', 'd', 'Express service, limited stops')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Insert mock data for public_holidays
    await client.query(`
      INSERT INTO public_holidays (name, date) VALUES 
      ('New Year''s Day', '2023-01-01'),
      ('Christmas Day', '2023-12-25'),
      ('Boxing Day', '2023-12-26'),
      ('New Year''s Day', '2024-01-01'),
      ('Memorial Day', '2024-05-27'),
      ('Independence Day', '2024-07-04'),
      ('Labor Day', '2024-09-02'),
      ('Thanksgiving Day', '2024-11-28'),
      ('Christmas Day', '2024-12-25'),
      ('New Year''s Day', '2025-01-01'),
      ('Memorial Day', '2025-05-26')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Tables created and mock data inserted successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();