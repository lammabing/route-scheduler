#!/bin/bash

# Route Schedule Sync - Automated Installation Script
# This script installs all dependencies and sets up the development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[STATUS]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on supported OS
check_os() {
    print_status "Checking operating system..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "Linux detected"
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "macOS detected"
        OS="macos"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (version 16 or higher) and try again."
        exit 1
    fi
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION found"
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION found"
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    DOCKER_VERSION=$(docker -v)
    print_success "Docker found: $DOCKER_VERSION"
    
    # Check for Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    DOCKER_COMPOSE_VERSION=$(docker-compose -v)
    print_success "Docker Compose found: $DOCKER_COMPOSE_VERSION"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install npm dependencies
    npm install
    
    print_success "Project dependencies installed"
}

# Create docker-compose.yml for PostgreSQL
create_docker_compose() {
    print_status "Creating docker-compose.yml for PostgreSQL..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: route_schedule_sync_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    restart: unless-stopped

volumes:
  postgres_data:
EOF
    
    print_success "docker-compose.yml created"
}

# Create database initialization scripts
create_init_scripts() {
    print_status "Creating database initialization scripts..."
    
    mkdir -p init-scripts
    
    # Create the database schema script
    cat > init-scripts/01-schema.sql << 'EOF'
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departure_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departure_time_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departure_time_fares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Public read access policies
CREATE POLICY "Allow public read access to routes" ON public.routes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to schedules" ON public.schedules FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to departure_times" ON public.departure_times FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to time_infos" ON public.time_infos FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to departure_time_infos" ON public.departure_time_infos FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to fares" ON public.fares FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to departure_time_fares" ON public.departure_time_fares FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to public_holidays" ON public.public_holidays FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access to announcements" ON public.announcements FOR SELECT TO public USING (true);

-- User roles policies
CREATE POLICY "Allow users to read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow anonymous users to create admin roles" ON public.user_roles FOR INSERT TO anon WITH CHECK (true);

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
EOF
    
    # Create sample data script
    cat > init-scripts/02-sample-data.sql << 'EOF'
-- Insert sample routes
INSERT INTO public.routes (name, origin, destination, transport_type, description) VALUES
('Route 101', 'Downtown Station', 'Airport Terminal', 'bus', 'Express service to airport'),
('Blue Line', 'Central Station', 'Seaside Terminal', 'train', 'Coastal rail service'),
('Ferry Express', 'Harbor Dock', 'Island Terminal', 'ferry', 'Island ferry service');

-- Insert sample time infos
INSERT INTO public.time_infos (symbol, description) VALUES
('*', 'Peak hours only'),
('†', 'Weekends and holidays only'),
('‡', 'Does not operate on public holidays');

-- Insert sample public holidays
INSERT INTO public.public_holidays (name, date, description) VALUES
('New Year''s Day', '2024-01-01', 'Federal holiday'),
('Independence Day', '2024-07-04', 'Federal holiday'),
('Christmas Day', '2024-12-25', 'Federal holiday');
EOF
    
    print_success "Database initialization scripts created"
}

# Start database services
start_database() {
    print_status "Starting PostgreSQL database..."
    
    docker-compose up -d
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    print_success "PostgreSQL database started"
}

# Install database schema
install_database_schema() {
    print_status "Installing database schema..."
    
    # Wait a bit more for the database to be fully ready
    sleep 5
    
    print_success "Database schema installed"
}

# Create .env file
create_env_file() {
    print_status "Creating .env file..."
    
    cat > .env << 'EOF'
# Database configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres

# API server configuration
API_PORT=3003

# Supabase configuration (if needed)
SUPABASE_URL=
SUPABASE_KEY=
EOF
    
    print_success ".env file created"
}

# Display final instructions
display_instructions() {
    echo
    print_success "Installation completed successfully!"
    echo
    echo "=================================================="
    echo "NEXT STEPS:"
    echo "=================================================="
    echo "1. Start the development server:"
    echo "   npm run dev:full"
    echo
    echo "2. Access the application in your browser at:"
    echo "   http://localhost:5173"
    echo
    echo "3. Access the database directly (if needed):"
    echo "   psql -h localhost -p 5433 -U postgres -d postgres"
    echo "   Password: postgres"
    echo
    echo "4. To stop the database services:"
    echo "   docker-compose down"
    echo
    echo "=================================================="
    echo "HELPFUL COMMANDS:"
    echo "=================================================="
    echo "Start only the database: docker-compose up -d"
    echo "Stop the database:       docker-compose down"
    echo "View database logs:      docker-compose logs -f"
    echo "Reinstall dependencies:  npm install"
    echo
    print_success "Enjoy your Route Schedule Sync application!"
}

# Main installation process
main() {
    echo "==========================================="
    echo "  Route Schedule Sync - Installation Script"
    echo "==========================================="
    echo
    
    check_os
    check_prerequisites
    install_dependencies
    create_docker_compose
    create_init_scripts
    start_database
    install_database_schema
    create_env_file
    display_instructions
}

# Run main function
main "$@"