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