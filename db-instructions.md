
# Database Instructions

This document provides comprehensive information about the database structure, table schemas, and SQL statements needed to reproduce the transit schedule management database.

## Overview

This database is designed for a public transit schedule management system that supports:
- Multiple routes with different transport types
- Complex scheduling (weekday, weekend, holiday schedules)
- Fare management with different pricing tiers
- Public holiday tracking
- System announcements
- Time-based information symbols
- User role management for admin access

## Database Schema

### Core Tables

#### 1. Routes Table
Stores information about transit routes.

```sql
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
```

#### 2. Schedules Table
Links routes to specific schedule configurations.

```sql
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
```

#### 3. Departure Times Table
Stores individual departure times for each schedule.

```sql
CREATE TABLE public.departure_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Time Infos Table
Stores symbols and descriptions for additional time-based information.

```sql
CREATE TABLE public.time_infos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Departure Time Infos Table
Junction table linking departure times to time info symbols.

```sql
CREATE TABLE public.departure_time_infos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departure_time_id UUID REFERENCES public.departure_times(id) ON DELETE CASCADE,
  time_info_id UUID REFERENCES public.time_infos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(departure_time_id, time_info_id)
);
```

#### 6. Fares Table
Stores fare information for schedules.

```sql
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
```

#### 7. Departure Time Fares Table
Junction table linking departure times to specific fares.

```sql
CREATE TABLE public.departure_time_fares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  departure_time_id UUID REFERENCES public.departure_times(id) ON DELETE CASCADE,
  fare_id UUID REFERENCES public.fares(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(departure_time_id, fare_id)
);
```

#### 8. Public Holidays Table
Stores public holiday information.

```sql
CREATE TABLE public.public_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 9. Announcements Table
Stores system announcements and notices.

```sql
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
```

#### 10. User Roles Table
Manages user permissions for admin access.

```sql
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);
```

## Indexes and Performance

### Recommended Indexes

```sql
-- Performance indexes for common queries
CREATE INDEX idx_schedules_route_id ON public.schedules(route_id);
CREATE INDEX idx_departure_times_schedule_id ON public.departure_times(schedule_id);
CREATE INDEX idx_departure_times_time ON public.departure_times(time);
CREATE INDEX idx_fares_schedule_id ON public.fares(schedule_id);
CREATE INDEX idx_announcements_route_id ON public.announcements(route_id);
CREATE INDEX idx_announcements_effective_dates ON public.announcements(effective_from, effective_until);
CREATE INDEX idx_public_holidays_date ON public.public_holidays(date);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
```

## Row Level Security (RLS)

### Enable RLS on all tables

```sql
-- Enable RLS on all tables
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
```

### Basic RLS Policies

```sql
-- Allow public read access to routes, schedules, and related data
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
```

## Functions and Triggers

### Update Timestamp Function

```sql
-- Function to update the updated_at field
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Apply Update Triggers

```sql
-- Triggers to update the updated_at field
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
```

## Complete Database Setup Script

Here's the complete SQL script to set up the entire database:

```sql
-- =============================================
-- COMPLETE DATABASE SETUP SCRIPT
-- =============================================

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

-- =============================================
-- CREATE TABLES
-- =============================================

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

-- =============================================
-- CREATE INDEXES
-- =============================================

CREATE INDEX idx_schedules_route_id ON public.schedules(route_id);
CREATE INDEX idx_departure_times_schedule_id ON public.departure_times(schedule_id);
CREATE INDEX idx_departure_times_time ON public.departure_times(time);
CREATE INDEX idx_fares_schedule_id ON public.fares(schedule_id);
CREATE INDEX idx_announcements_route_id ON public.announcements(route_id);
CREATE INDEX idx_announcements_effective_dates ON public.announcements(effective_from, effective_until);
CREATE INDEX idx_public_holidays_date ON public.public_holidays(date);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- =============================================
-- ENABLE RLS
-- =============================================

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

-- =============================================
-- CREATE RLS POLICIES
-- =============================================

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

-- =============================================
-- CREATE TRIGGERS
-- =============================================

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
```

## Sample Data

### Sample Routes
```sql
INSERT INTO public.routes (name, origin, destination, transport_type, description) VALUES
('Route 101', 'Downtown Station', 'Airport Terminal', 'bus', 'Express service to airport'),
('Blue Line', 'Central Station', 'Seaside Terminal', 'train', 'Coastal rail service'),
('Ferry Express', 'Harbor Dock', 'Island Terminal', 'ferry', 'Island ferry service');
```

### Sample Time Infos
```sql
INSERT INTO public.time_infos (symbol, description) VALUES
('*', 'Peak hours only'),
('†', 'Weekends and holidays only'),
('‡', 'Does not operate on public holidays');
```

### Sample Public Holidays
```sql
INSERT INTO public.public_holidays (name, date, description) VALUES
('New Year''s Day', '2024-01-01', 'Federal holiday'),
('Independence Day', '2024-07-04', 'Federal holiday'),
('Christmas Day', '2024-12-25', 'Federal holiday');
```

## Notes

1. **Supabase Integration**: This schema is designed to work with Supabase's authentication system via the `auth.users` table reference.

2. **Flexibility**: The schema supports multiple transport types and complex scheduling scenarios.

3. **Scalability**: Junction tables allow for many-to-many relationships between departure times, fares, and time info symbols.

4. **Security**: RLS policies ensure proper data access control while allowing public read access to schedule information.

5. **Maintenance**: Automatic timestamp updates track when records are modified.

6. **Performance**: Indexes are strategically placed on commonly queried columns.

This database structure provides a robust foundation for a comprehensive transit schedule management system with full administrative capabilities.
