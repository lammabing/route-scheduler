# Database Transfer Script

This directory contains scripts for transferring data from the Supabase remote database to a local PostgreSQL database.

## Files

- `import-database.js` - Original script for importing data only
- `transfer-database.js` - Improved script that transfers both schema and data
- `QWEN.md` - Documentation for the original script

## Prerequisites

1. A running local PostgreSQL instance
2. A database named `route_schedule_sync` (or update the `.env` file with your database name)
3. The `postgres` user with appropriate permissions (or update the `.env` file with your user)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables in the `.env` file:
   - Update `LOCAL_DB_PASSWORD` with your PostgreSQL password
   - Modify other values as needed

## Usage

To transfer the Supabase schema and data to your local PostgreSQL database:

```bash
npm run db:transfer
```

This will:
1. Connect to the Supabase database
2. Connect to your local PostgreSQL database
3. Drop and recreate all tables in your local database
4. Transfer all data from Supabase to your local database

## Environment Variables

The script uses the following environment variables:

- `SUPABASE_URL` - The URL of your Supabase project
- `SUPABASE_KEY` - The API key for your Supabase project
- `LOCAL_DB_HOST` - The host of your local PostgreSQL database
- `LOCAL_DB_PORT` - The port of your local PostgreSQL database
- `LOCAL_DB_NAME` - The name of your local database
- `LOCAL_DB_USER` - The username for your local database
- `LOCAL_DB_PASSWORD` - The password for your local database

## Security Notes

- Never commit your `.env` file to version control
- The Supabase API key should be treated as a secret
- In production, use environment variables rather than hardcoded values