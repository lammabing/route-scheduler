# Route Schedule Sync - Database Import Script

## Project Overview
This directory contains a Node.js script for synchronizing data between a Supabase remote database and a local PostgreSQL database. The primary purpose is to export data from Supabase and import it into a local PostgreSQL instance, which is useful for development and testing purposes.

## Key Technologies
- **Node.js**: JavaScript runtime environment
- **Supabase**: Cloud database platform (PostgreSQL-based)
- **PostgreSQL**: Local relational database
- **JavaScript**: Primary programming language

## Script Functionality
The `import-database.js` script performs the following operations:
1. Connects to both Supabase (remote) and local PostgreSQL databases
2. Retrieves all table names from the Supabase public schema
3. For each table:
   - Exports all data from Supabase
   - Clears the corresponding local table
   - Imports the data into the local table
4. Handles connection errors and data transfer issues

## Configuration
The script contains hardcoded connection details:
- **Supabase**: 
  - URL: `https://prwxksesdppvgjlvpemx.supabase.co`
  - API Key: Embedded in the script (should be secured in production)
- **Local PostgreSQL**:
  - Host: localhost
  - Database: route_schedule_sync
  - User: postgres
  - Port: 5432
  - Password: Empty (needs to be configured)

## Usage Instructions
To run the database import script:
```bash
node import-database.js
```

## Development Notes
1. **Security Concern**: The Supabase API key is hardcoded in the script. This should be moved to environment variables in production.
2. **Database Password**: The local PostgreSQL password is empty and needs to be configured.
3. **Dependencies**: Requires the following npm packages:
   - `@supabase/supabase-js`
   - `pg` (node-postgres)

To install dependencies:
```bash
npm install @supabase/supabase-js pg
```

## Potential Improvements
1. Add environment variable support for credentials
2. Add command-line options for configuration
3. Add more robust error handling and logging
4. Add selective table import functionality
5. Add data validation during transfer