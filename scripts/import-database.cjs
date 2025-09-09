const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Supabase connection details
const supabaseUrl = 'https://prwxksesdppvgjlvpemx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3hrc2VzZHBwdmdqbHZwZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODY5ODAsImV4cCI6MjA2MjM2Mjk4MH0.VBR3hTNxpAYeS75HLd3yW2TtxT7gtuB4Q5rPypN8Jzk';

// Local PostgreSQL connection details
const localDbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'route_schedule_sync',
  port: 5432,
};

// Add password only if it's not empty
if (process.env.LOCAL_DB_PASSWORD && process.env.LOCAL_DB_PASSWORD.trim() !== '') {
  localDbConfig.password = process.env.LOCAL_DB_PASSWORD;
}

async function exportAndImport() {
  try {
    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Connecting to local PostgreSQL...');
    const localPool = new Pool(localDbConfig);
    
    // Test connections
    await supabase.from('routes').select('count', { count: 'exact', head: true });
    console.log('✓ Supabase connection successful');
    
    await localPool.query('SELECT 1');
    console.log('✓ Local PostgreSQL connection successful');
    
    // Get all tables from Supabase
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) throw tablesError;
    
    console.log('Found tables:', tables.map(t => t.table_name));
    
    // Export and import each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log('\nExporting table: ' + tableName);
      
      // Export data from Supabase
      const { data: tableData, error: exportError } = await supabase
        .from(tableName)
        .select('*');
      
      if (exportError) {
        console.error('Error exporting ' + tableName + ':', exportError);
        continue;
      }
      
      if (!tableData || tableData.length === 0) {
        console.log('No data in ' + tableName + ', skipping...');
        continue;
      }
      
      console.log('Exported ' + tableData.length + ' rows from ' + tableName);
      
      // Clear local table
      await localPool.query('TRUNCATE TABLE ' + tableName + ' CASCADE');
      console.log('Cleared local table: ' + tableName);
      
      // Insert data into local table
      if (tableData.length > 0) {
        const columns = Object.keys(tableData[0]);
        const columnNames = columns.join(', ');
        const placeholders = columns.map((_, i) => '$' + (i + 1)).join(', ');
        
        const insertQuery = 'INSERT INTO ' + tableName + ' (' + columnNames + ') VALUES (' + placeholders + ')';
        
        for (const row of tableData) {
          const values = columns.map(col => row[col]);
          await localPool.query(insertQuery, values);
        }
        
        console.log('Imported ' + tableData.length + ' rows into ' + tableName);
      }
    }
    
    console.log('\n✓ Database import completed successfully!');
    
    // Close connections
    await localPool.end();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

exportAndImport();