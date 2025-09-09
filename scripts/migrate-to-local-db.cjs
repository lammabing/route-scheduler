const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Supabase connection details
const supabaseUrl = 'https://prwxksesdppvgjlvpemx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hrc2VzZHBwdmdqbHZwZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5ODAsImV4cCI6MjA2MjM2Mjk4MH0.VBR3hTNxpAYeS75HLd3yW2TtxT7gtuB4Q5rPypN8Jzk';

// Target PostgreSQL connection details (your specified connection)
const targetDbConfig = {
  connectionString: 'postgresql://postgres:postgres@localhost:5433/postgres'
};

async function migrateSchemaAndData() {
  let supabase;
  let targetPool;
  
  try {
    console.log('Connecting to Supabase...');
    supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Connecting to target PostgreSQL...');
    targetPool = new Pool(targetDbConfig);
    
    // Test connections
    const { error: supabaseError } = await supabase
      .from('routes')
      .select('count', { count: 'exact', head: true });
    
    if (supabaseError) throw new Error('Supabase connection failed: ' + supabaseError.message);
    console.log('✓ Supabase connection successful');
    
    const targetTest = await targetPool.query('SELECT 1');
    if (!targetTest) throw new Error('Target PostgreSQL connection failed');
    console.log('✓ Target PostgreSQL connection successful');
    
    // Define tables that exist
    const tables = [
      { 
        name: 'routes',
        schema: `
          CREATE TABLE IF NOT EXISTS routes (
            id UUID PRIMARY KEY,
            name TEXT,
            code TEXT,
            description TEXT,
            origin TEXT,
            destination TEXT,
            transport_type TEXT,
            featured_image TEXT,
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE
          )
        `
      },
      { 
        name: 'schedules',
        schema: `
          CREATE TABLE IF NOT EXISTS schedules (
            id UUID PRIMARY KEY,
            route_id UUID,
            name TEXT,
            effective_from DATE,
            effective_until DATE,
            is_weekend_schedule BOOLEAN,
            is_holiday_schedule BOOLEAN,
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE
          )
        `
      }
    ];
    
    console.log('Processing tables:', tables.map(t => t.name));
    
    // Export and import each table
    for (const table of tables) {
      const tableName = table.name;
      console.log('\nProcessing table: ' + tableName);
      
      // Create table in target database with proper schema
      try {
        await targetPool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
        await targetPool.query(table.schema);
        console.log('Created table structure for: ' + tableName);
      } catch (createError) {
        console.error('Error creating table ' + tableName + ':', createError.message);
        continue;
      }
      
      // Export data from Supabase
      const { data: tableData, error: exportError } = await supabase
        .from(tableName)
        .select('*');
      
      if (exportError) {
        console.error('Error exporting ' + tableName + ':', exportError);
        continue;
      }
      
      if (!tableData || tableData.length === 0) {
        console.log('No data in ' + tableName + ', skipping data import...');
        continue;
      }
      
      console.log('Exported ' + tableData.length + ' rows from ' + tableName);
      
      // Insert data into target table
      if (tableData.length > 0) {
        // For each row, we'll need to dynamically create the insert statement
        for (const row of tableData) {
          const columns = Object.keys(row);
          const columnNames = columns.join(', ');
          const placeholders = columns.map((_, i) => '$' + (i + 1)).join(', ');
          
          // Handle special data types
          const values = columns.map(col => {
            if (row[col] === null || row[col] === undefined) {
              return null;
            }
            // Convert objects to JSON strings if needed
            if (typeof row[col] === 'object' && !Array.isArray(row[col])) {
              return JSON.stringify(row[col]);
            }
            if (Array.isArray(row[col])) {
              return JSON.stringify(row[col]);
            }
            return row[col];
          });
          
          const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
          
          try {
            await targetPool.query(insertQuery, values);
          } catch (insertError) {
            console.error(`Error inserting row into ${tableName}:`, insertError.message);
            console.error('Row data:', row);
            // Continue with other rows
          }
        }
        
        console.log('Imported ' + tableData.length + ' rows into ' + tableName);
      }
    }
    
    console.log('\n✓ Database migration completed successfully!');
    
    // Close connections
    await targetPool.end();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

migrateSchemaAndData();