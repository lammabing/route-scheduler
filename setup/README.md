# Route Schedule Sync - Installation Guide

This guide explains how to install and set up the Route Schedule Sync application.

## Prerequisites

Before running the installation script, ensure you have the following installed on your system:

1. **Node.js** (version 16 or higher)
2. **npm** (comes with Node.js)
3. **Docker** (including Docker Compose)

You can verify these are installed by running:
```bash
node --version
npm --version
docker --version
docker-compose --version
```

## Installation

Run the automated installation script:

```bash
cd setup
./install.sh
```

The script will:
1. Check your system for required tools
2. Install all npm dependencies
3. Create a Docker Compose configuration for PostgreSQL
4. Set up the database schema and sample data
5. Create necessary environment files

## Starting the Application

After installation, start the development environment:

```bash
npm run dev:full
```

This command will start both:
- The API server on port 3003
- The React development server on port 5173

Visit http://localhost:5173 in your browser to access the application.

## Database Access

The PostgreSQL database is available at:
- Host: localhost
- Port: 5433
- Database: postgres
- Username: postgres
- Password: postgres

You can connect directly using:
```bash
psql -h localhost -p 5433 -U postgres -d postgres
```

## Managing Services

To control the database service independently:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f
```

## Troubleshooting

If you encounter any issues:

1. **Database connection errors**: Ensure Docker is running and the database service is started
2. **Port conflicts**: Check if ports 5433 or 5173 are already in use
3. **Permission errors**: Ensure you have proper permissions to run Docker commands

For additional help, check the main project README.md file.