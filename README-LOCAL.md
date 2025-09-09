# Route Schedule Sync - Local Database Version

This is a modified version of the Route Schedule Sync application that uses a local PostgreSQL database instead of Supabase.

## Prerequisites

1. PostgreSQL database running on port 5433 with the following credentials:
   - Host: localhost
   - Port: 5433
   - Database: postgres
   - Username: postgres
   - Password: postgres

2. The database should already be populated with data from Supabase.

## Running the Application

### Option 1: Run the API server and development server separately

1. Start the API server:
   ```
   npm run server
   ```

2. In a separate terminal, start the development server:
   ```
   npm run dev
   ```

### Option 2: Run both servers concurrently

```
npm run dev:full
```

## API Endpoints

The local API server runs on port 3003 and provides the following endpoints:

- `GET /api/test` - Test endpoint
- `GET /api/routes` - Get all routes
- `GET /api/schedules` - Get all schedules
- `GET /api/time-infos` - Get all time infos
- `GET /api/public-holidays` - Get all public holidays
- `GET /api/departure-times/:scheduleId` - Get departure times for a specific schedule
- `GET /api/fares/:scheduleId` - Get fares for a specific schedule
- `GET /api/departure-time-infos/:departureTimeId` - Get time infos for a specific departure time
- `GET /api/departure-time-fares/:departureTimeId` - Get fares for a specific departure time

## Architecture

The application has been modified to use a local PostgreSQL database instead of Supabase. The architecture is as follows:

1. **Frontend**: React application that fetches data from the local API server
2. **API Server**: Express.js server that connects to the local PostgreSQL database and provides REST endpoints
3. **Database**: PostgreSQL database running on port 5433

## Migration from Supabase

The original application used Supabase for data storage. The migration process involved:

1. Exporting data from Supabase
2. Creating the necessary tables in the local PostgreSQL database
3. Importing the data into the local database
4. Creating an API server to serve the data
5. Modifying the frontend to use the local API instead of Supabase

## Development

To modify the application:

1. Update the frontend components in `src/` to use the local API
2. Modify the API server in `src/lib/api-server.cjs` to add new endpoints
3. Update the database schema in `scripts/create-local-tables.cjs` if needed