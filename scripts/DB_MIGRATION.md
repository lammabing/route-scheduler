# Database Migration Guide

This guide explains how to migrate data from Supabase to a local PostgreSQL database for the Route Schedule Sync project.

## Prerequisites

1. Node.js installed
2. PostgreSQL server running locally
3. Supabase project with data (connection details in `.env`)

## Environment Variables

Make sure your `.env` file contains the correct database connection details:

```env
# Supabase Configuration
SUPABASE_URL=https://prwxksesdppvgjlvpemx.supabase.co
SUPABASE_KEY=your_supabase_key_here

# Local PostgreSQL Configuration
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=5432
LOCAL_DB_NAME=route_schedule_sync
LOCAL_DB_USER=postgres
LOCAL_DB_PASSWORD=your_password_here
```

## Migration Process

### 1. Setup Local Database

First, create the local database and enable required extensions:

```bash
npm run db:setup
```

This script will:
- Create the database if it doesn't exist
- Enable the `uuid-ossp` extension for UUID generation

### 2. Migrate Database Schema and Data

Run the migration script to transfer both schema and data:

```bash
npm run db:migrate
```

This script will:
- Connect to both Supabase and local PostgreSQL databases
- Recreate the complete database schema in your local database
- Transfer all data from Supabase to your local database
- Handle errors gracefully with detailed logging

### 3. Alternative Transfer Script

If you prefer to keep existing local data and only transfer new data:

```bash
npm run db:transfer
```

### 4. Legacy Import Script

There's also a legacy import script available:

```bash
node scripts/import-database.cjs
```

This script will:
- Connect to both databases
- Transfer data without recreating the schema
- Truncate existing data before inserting new data

## Troubleshooting

### Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   # Linux/macOS
   pg_isready -h localhost -p 5432
   
   # Windows
   pg_isready.exe -h localhost -p 5432
   ```

2. Check environment variables in `.env` file

3. Ensure PostgreSQL user has CREATEDB privileges

### Common Errors

1. **"Database does not exist"**: Run `npm run db:setup` first
2. **"Extension not found"**: Make sure PostgreSQL contrib package is installed
3. **"Permission denied"**: Check user privileges in PostgreSQL

## Database Schema

The migration process creates the following tables:

1. `routes` - Transit route information
2. `schedules` - Schedule configurations for routes
3. `departure_times` - Individual departure times
4. `time_infos` - Symbols for additional time information
5. `departure_time_infos` - Junction table linking departure times to time info
6. `fares` - Fare information for schedules
7. `departure_time_fares` - Junction table linking departure times to fares
8. `public_holidays` - Public holiday information
9. `announcements` - System announcements
10. `user_roles` - User permission management

## Notes

- The migration script drops and recreates tables to ensure consistency
- All existing data in the local database will be lost during migration
- Make backups before running migration scripts
- The process preserves UUID primary keys from Supabase
- Foreign key relationships are maintained