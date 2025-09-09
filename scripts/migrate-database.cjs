const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const fs = require('fs').promises;

// Load environment variables
require('dotenv').config();

// Supabase connection details
const supabaseUrl = process.env.SUPABASE_URL || 'https://prwxksesdppvgjlvpemx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hrc2VzZHBwdmdqbHZwZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5ODAsImV4cCI6MjA2MjM2Mjk4MH0.VBR3hTNxpAYeS75HLd3yW2TtxT7gtuB4Q5rPypN8Jzk';

// Local PostgreSQL connection details
const localDbConfig = {
  user: process.env.LOCAL_DB_USER || 'postgres',
  host: process.env.LOCAL_DB_HOST || 'localhost',
  database: process.env.LOCAL_DB_NAME || 'route_schedule_sync',
  port: process.env.LOCAL_DB_PORT || 5432,
};

// Add password only if it's not empty
if (process.env.LOCAL_DB_PASSWORD && process.env.LOCAL_DB_PASSWORD.trim() !== '') {
  localDbConfig.password = process.env.LOCAL_DB_PASSWORD;
}

// Database schema creation script
const schemaScript = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing tables if they exist (in correct order to avoid foreign key issues)
DROP TABLE IF EXISTS public.departure_time_fares CASCADE;
DROP TABLE IF EXISTS public.departure_time_infos CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.public_holidays CASCADE;
DROP TABLE IF EXISTS public.fares CASCADE;
DROP TABLE IF EXISTS public.time_infos CASCADE;
DROP TABLE IF EXISTS public.departure_times CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;

-- Create tables
-- Routes table
CREATE TABLE public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  transport_type TEXT DEFAULT 'bus' CHECK (transport_type IN ('bus', 'train', 'ferry', 'tram', 'metro', 'other')),
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules table
CREATE TABLE public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  effective_from DATE,
  effective_until DATE,
  is_weekend_schedule BOOLEAN DEFAULT false,
  is_holiday_schedule BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departure times table
CREATE TABLE public.departure_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time infos table
CREATE TABLE public.time_infos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departure time infos junction table
CREATE TABLE public.departure_time_infos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departure_time_id UUID REFERENCES public.departure_times(id) ON DELETE CASCADE,
  time_info_id UUID REFERENCES public.time_infos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(departure_time_id, time_info_id)
);

-- Fares table
CREATE TABLE public.fares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fare_type TEXT DEFAULT 'standard' CHECK (fare_type IN ('standard', 'concession', 'student', 'senior', 'child', 'other')),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departure time fares junction table
CREATE TABLE public.departure_time_fares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departure_time_id UUID REFERENCES public.departure_times(id) ON DELETE CASCADE,
  fare_id UUID REFERENCES public.fares(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(departure_time_id, fare_id)
);

-- Public holidays table
CREATE TABLE public.public_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  urgency TEXT DEFAULT 'info' CHECK (urgency IN ('info', 'important', 'urgent')),
  effective_from DATE,
  effective_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create indexes
CREATE INDEX idx_schedules_route_id ON public.schedules(route_id);
CREATE INDEX idx_departure_times_schedule_id ON public.departure_times(schedule_id);
CREATE INDEX idx_departure_times_time ON public.departure_times(time);
CREATE INDEX idx_fares_schedule_id ON public.fares(schedule_id);
CREATE INDEX idx_announcements_route_id ON public.announcements(route_id);
CREATE INDEX idx_announcements_effective_dates ON public.announcements(effective_from, effective_until);
CREATE INDEX idx_public_holidays_date ON public.public_holidays(date);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Create triggers
CREATE OR REPLACE TRIGGER update_routes_timestamp
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER update_schedules_timestamp
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER update_time_infos_timestamp
BEFORE UPDATE ON public.time_infos
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER update_fares_timestamp
BEFORE UPDATE ON public.fares
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER update_public_holidays_timestamp
BEFORE UPDATE ON public.public_holidays
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER update_announcements_timestamp
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER update_user_roles_timestamp
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
`;

async function migrateDatabase() {
  let supabase;
  let localPool;
  
  try {
    console.log('Starting database migration from Supabase to local PostgreSQL...');
    
    console.log('Connecting to Supabase...');
    supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Connecting to local PostgreSQL...');
    localPool = new Pool(localDbConfig);
    
    // Test connections
    const { error: supabaseError } = await supabase
      .from('routes')
      .select('count', { count: 'exact', head: true });
    
    if (supabaseError) throw new Error('Supabase connection failed: ' + supabaseError.message);
    console.log('✓ Supabase connection successful');
    
    const localTest = await localPool.query('SELECT 1');
    if (!localTest) throw new Error('Local PostgreSQL connection failed');
    console.log('✓ Local PostgreSQL connection successful');
    
    // Create schema in local database
    console.log('\nCreating database schema in local PostgreSQL...');
    await localPool.query(schemaScript);
    console.log('✓ Database schema created successfully');
    
    // Get all tables from Supabase
    console.log('\nRetrieving table list from Supabase...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'migrations')
      .neq('table_name', 'migrations_lock');
    
    if (tablesError) throw tablesError;
    
    const tableNames = tables.map(t => t.table_name);
    console.log('Found tables:', tableNames);
    
    // Export and import each table
    for (const tableName of tableNames) {
      console.log('\nProcessing table: ' + tableName);
      
      // Export data from Supabase
      console.log('  Exporting data from Supabase...');
      const { data: tableData, error: exportError } = await supabase
        .from(tableName)
        .select('*');
      
      if (exportError) {
        console.error('  Error exporting ' + tableName + ':', exportError);
        continue;
      }
      
      if (!tableData || tableData.length === 0) {
        console.log('  No data in ' + tableName + ', skipping...');
        continue;
      }
      
      console.log('  Exported ' + tableData.length + ' rows from ' + tableName);
      
      // Insert data into local table
      if (tableData.length > 0) {
        console.log('  Importing data to local database...');
        const columns = Object.keys(tableData[0]);
        const columnNames = columns.join(', ');
        
        // Prepare batch insert
        const values = [];
        const placeholders = [];
        
        for (let i = 0; i < tableData.length; i++) {
          const row = tableData[i];
          const rowPlaceholders = [];
          
          for (let j = 0; j < columns.length; j++) {
            values.push(row[columns[j]]);
            rowPlaceholders.push('$' + (values.length));
          }
          
          placeholders.push('(' + rowPlaceholders.join(', ') + ')');
        }
        
        const insertQuery = 'INSERT INTO ' + tableName + ' (' + columnNames + ') VALUES ' + placeholders.join(', ');
        
        try {
          await localPool.query(insertQuery, values);
          console.log('  ✓ Imported ' + tableData.length + ' rows into ' + tableName);
        } catch (insertError) {
          console.error('  Error importing data to ' + tableName + ':', insertError);
          // Try row by row insertion for better error handling
          let successCount = 0;
          let errorCount = 0;
          
          for (const row of tableData) {
            try {
              const rowValues = columns.map(col => row[col]);
              const rowPlaceholders = columns.map((_, i) => '$' + (i + 1)).join(', ');
              const rowInsertQuery = 'INSERT INTO ' + tableName + ' (' + columnNames + ') VALUES (' + rowPlaceholders + ')';
              await localPool.query(rowInsertQuery, rowValues);
              successCount++;
            } catch (rowError) {
              errorCount++;
              console.error('    Error inserting row in ' + tableName + ':', rowError.message);
            }
          }
          
          console.log('  Partial import result: ' + successCount + ' successful, ' + errorCount + ' failed');
        }
      }
    }
    
    console.log('\n✓ Database migration completed successfully!');
    
    // Close connections
    await localPool.end();
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    
    // Close connections if they exist
    if (localPool) {
      try {
        await localPool.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
    
    process.exit(1);
  }
}

migrateDatabase();