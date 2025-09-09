const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Local PostgreSQL connection details
const localDbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5433,
};

// Create a connection pool
const pool = new Pool(localDbConfig);

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.get('/api/routes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

app.post('/api/routes', async (req, res) => {
  try {
    const { name, origin, destination, transport_type, description, featured_image } = req.body;
    const result = await pool.query(
      'INSERT INTO routes (name, origin, destination, transport_type, description, featured_image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, origin, destination, transport_type, description, featured_image]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

app.put('/api/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, origin, destination, transport_type, description, featured_image } = req.body;
    const result = await pool.query(
      'UPDATE routes SET name = $1, origin = $2, destination = $3, transport_type = $4, description = $5, featured_image = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [name, origin, destination, transport_type, description, featured_image, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

// Schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const { route_id, name, effective_from, effective_until, is_weekend_schedule, is_holiday_schedule } = req.body;
    const result = await pool.query(
      'INSERT INTO schedules (route_id, name, effective_from, effective_until, is_weekend_schedule, is_holiday_schedule) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [route_id, name, effective_from, effective_until, is_weekend_schedule, is_holiday_schedule]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { route_id, name, effective_from, effective_until, is_weekend_schedule, is_holiday_schedule } = req.body;
    const result = await pool.query(
      'UPDATE schedules SET route_id = $1, name = $2, effective_from = $3, effective_until = $4, is_weekend_schedule = $5, is_holiday_schedule = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [route_id, name, effective_from, effective_until, is_weekend_schedule, is_holiday_schedule, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Time infos
app.get('/api/time-infos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM time_infos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching time infos:', error);
    res.status(500).json({ error: 'Failed to fetch time infos' });
  }
});

app.post('/api/time-infos', async (req, res) => {
  try {
    const { id, symbol, description } = req.body;
    const result = await pool.query(
      'INSERT INTO time_infos (id, symbol, description) VALUES ($1, $2, $3) RETURNING *',
      [id, symbol, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating time info:', error);
    res.status(500).json({ error: 'Failed to create time info' });
  }
});

app.put('/api/time-infos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { symbol, description } = req.body;
    const result = await pool.query(
      'UPDATE time_infos SET symbol = $1, description = $2 WHERE id = $3 RETURNING *',
      [symbol, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time info not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating time info:', error);
    res.status(500).json({ error: 'Failed to update time info' });
  }
});

app.delete('/api/time-infos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM time_infos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time info not found' });
    }
    
    res.json({ message: 'Time info deleted successfully' });
  } catch (error) {
    console.error('Error deleting time info:', error);
    res.status(500).json({ error: 'Failed to delete time info' });
  }
});

// Public holidays
app.get('/api/public-holidays', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public_holidays');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    res.status(500).json({ error: 'Failed to fetch public holidays' });
  }
});

app.post('/api/public-holidays', async (req, res) => {
  try {
    const { name, date, description } = req.body;
    const result = await pool.query(
      'INSERT INTO public_holidays (name, date, description) VALUES ($1, $2, $3) RETURNING *',
      [name, date, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating public holiday:', error);
    res.status(500).json({ error: 'Failed to create public holiday' });
  }
});

app.put('/api/public-holidays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, description } = req.body;
    const result = await pool.query(
      'UPDATE public_holidays SET name = $1, date = $2, description = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, date, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Public holiday not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating public holiday:', error);
    res.status(500).json({ error: 'Failed to update public holiday' });
  }
});

app.delete('/api/public-holidays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM public_holidays WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Public holiday not found' });
    }
    
    res.json({ message: 'Public holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting public holiday:', error);
    res.status(500).json({ error: 'Failed to delete public holiday' });
  }
});

// Departure times
app.get('/api/departure-times/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const result = await pool.query('SELECT * FROM departure_times WHERE schedule_id = $1', [scheduleId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departure times:', error);
    res.status(500).json({ error: 'Failed to fetch departure times' });
  }
});

app.post('/api/departure-times', async (req, res) => {
  try {
    const { schedule_id, time } = req.body;
    const result = await pool.query(
      'INSERT INTO departure_times (schedule_id, time) VALUES ($1, $2) RETURNING *',
      [schedule_id, time]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating departure time:', error);
    res.status(500).json({ error: 'Failed to create departure time' });
  }
});

app.put('/api/departure-times/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { time } = req.body;
    const result = await pool.query(
      'UPDATE departure_times SET time = $1 WHERE id = $2 RETURNING *',
      [time, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Departure time not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating departure time:', error);
    res.status(500).json({ error: 'Failed to update departure time' });
  }
});

app.delete('/api/departure-times/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM departure_times WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Departure time not found' });
    }
    
    res.json({ message: 'Departure time deleted successfully' });
  } catch (error) {
    console.error('Error deleting departure time:', error);
    res.status(500).json({ error: 'Failed to delete departure time' });
  }
});

// Fares
app.get('/api/fares/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const result = await pool.query('SELECT * FROM fares WHERE schedule_id = $1', [scheduleId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fares:', error);
    res.status(500).json({ error: 'Failed to fetch fares' });
  }
});

app.post('/api/fares', async (req, res) => {
  try {
    const { schedule_id, name, fare_type, price, currency, description } = req.body;
    const result = await pool.query(
      'INSERT INTO fares (schedule_id, name, fare_type, price, currency, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [schedule_id, name, fare_type, price, currency, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating fare:', error);
    res.status(500).json({ error: 'Failed to create fare' });
  }
});

app.put('/api/fares/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fare_type, price, currency, description } = req.body;
    const result = await pool.query(
      'UPDATE fares SET name = $1, fare_type = $2, price = $3, currency = $4, description = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, fare_type, price, currency, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fare not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating fare:', error);
    res.status(500).json({ error: 'Failed to update fare' });
  }
});

app.delete('/api/fares/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM fares WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fare not found' });
    }
    
    res.json({ message: 'Fare deleted successfully' });
  } catch (error) {
    console.error('Error deleting fare:', error);
    res.status(500).json({ error: 'Failed to delete fare' });
  }
});

// User roles
app.get('/api/user-roles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM user_roles WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
});

app.listen(port, () => {
  console.log(`Local database API server running at http://localhost:${port}`);
});