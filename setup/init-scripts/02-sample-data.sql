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