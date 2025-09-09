import { localDb } from './local-db';

// Data fetching functions for local PostgreSQL database
export const fetchRoutes = async () => {
  try {
    const result = await localDb.query('SELECT * FROM routes');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code || undefined,
      description: row.description || undefined,
      origin: row.origin,
      destination: row.destination,
      transport_type: row.transport_type,
      featured_image: row.featured_image || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

export const fetchSchedules = async () => {
  try {
    const result = await localDb.query('SELECT * FROM schedules');
    return result.rows.map(row => ({
      id: row.id,
      route_id: row.route_id,
      name: row.name,
      effective_from: row.effective_from,
      effective_until: row.effective_until,
      is_weekend_schedule: row.is_weekend_schedule,
      is_holiday_schedule: row.is_holiday_schedule,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const fetchTimeInfos = async () => {
  try {
    const result = await localDb.query('SELECT * FROM time_infos');
    return result.rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      description: row.description || undefined
    }));
  } catch (error) {
    console.error('Error fetching time infos:', error);
    throw error;
  }
};

export const fetchPublicHolidays = async () => {
  try {
    const result = await localDb.query('SELECT * FROM public_holidays');
    return result.rows.map(row => ({
      date: row.date,
      title: row.name,
      description: row.description || undefined
    }));
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    throw error;
  }
};

export const fetchDepartureTimes = async (scheduleId: string) => {
  try {
    const result = await localDb.query('SELECT * FROM departure_times WHERE schedule_id = $1', [scheduleId]);
    return result.rows.map(row => ({
      id: row.id,
      schedule_id: row.schedule_id,
      time: row.time,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching departure times:', error);
    throw error;
  }
};

export const fetchFares = async (scheduleId: string) => {
  try {
    const result = await localDb.query('SELECT * FROM fares WHERE schedule_id = $1', [scheduleId]);
    return result.rows.map(row => ({
      id: row.id,
      schedule_id: row.schedule_id,
      name: row.name,
      fare_type: row.fare_type,
      price: parseFloat(row.price as any), // Convert to number
      currency: row.currency,
      description: row.description || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } catch (error) {
    console.error('Error fetching fares:', error);
    throw error;
  }
};

export const fetchDepartureTimeInfos = async (departureTimeId: string) => {
  try {
    const result = await localDb.query('SELECT * FROM departure_time_infos WHERE departure_time_id = $1', [departureTimeId]);
    return result.rows.map(row => ({
      id: row.id,
      departure_time_id: row.departure_time_id,
      time_info_id: row.time_info_id,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching departure time infos:', error);
    throw error;
  }
};

export const fetchDepartureTimeFares = async (departureTimeId: string) => {
  try {
    const result = await localDb.query('SELECT * FROM departure_time_fares WHERE departure_time_id = $1', [departureTimeId]);
    return result.rows.map(row => ({
      id: row.id,
      departure_time_id: row.departure_time_id,
      fare_id: row.fare_id,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching departure time fares:', error);
    throw error;
  }
};