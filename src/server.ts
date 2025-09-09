import express from 'express';
import cors from 'cors';
import { 
  fetchRoutes, 
  fetchSchedules, 
  fetchTimeInfos, 
  fetchPublicHolidays,
  fetchDepartureTimes,
  fetchFares,
  fetchDepartureTimeInfos,
  fetchDepartureTimeFares
} from './lib/local-db-api';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/routes', async (req, res) => {
  try {
    const routes = await fetchRoutes();
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await fetchSchedules();
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

app.get('/api/time-infos', async (req, res) => {
  try {
    const timeInfos = await fetchTimeInfos();
    res.json(timeInfos);
  } catch (error) {
    console.error('Error fetching time infos:', error);
    res.status(500).json({ error: 'Failed to fetch time infos' });
  }
});

app.get('/api/public-holidays', async (req, res) => {
  try {
    const publicHolidays = await fetchPublicHolidays();
    res.json(publicHolidays);
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    res.status(500).json({ error: 'Failed to fetch public holidays' });
  }
});

app.get('/api/departure-times/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const departureTimes = await fetchDepartureTimes(scheduleId);
    res.json(departureTimes);
  } catch (error) {
    console.error('Error fetching departure times:', error);
    res.status(500).json({ error: 'Failed to fetch departure times' });
  }
});

app.get('/api/fares/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const fares = await fetchFares(scheduleId);
    res.json(fares);
  } catch (error) {
    console.error('Error fetching fares:', error);
    res.status(500).json({ error: 'Failed to fetch fares' });
  }
});

app.get('/api/departure-time-infos/:departureTimeId', async (req, res) => {
  try {
    const { departureTimeId } = req.params;
    const departureTimeInfos = await fetchDepartureTimeInfos(departureTimeId);
    res.json(departureTimeInfos);
  } catch (error) {
    console.error('Error fetching departure time infos:', error);
    res.status(500).json({ error: 'Failed to fetch departure time infos' });
  }
});

app.get('/api/departure-time-fares/:departureTimeId', async (req, res) => {
  try {
    const { departureTimeId } = req.params;
    const departureTimeFares = await fetchDepartureTimeFares(departureTimeId);
    res.json(departureTimeFares);
  } catch (error) {
    console.error('Error fetching departure time fares:', error);
    res.status(500).json({ error: 'Failed to fetch departure time fares' });
  }
});

app.listen(port, () => {
  console.log(`Local database API server running at http://localhost:${port}`);
});