import express from 'express';
import cors from 'cors';
import { localDb } from './src/lib/local-db';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.get('/api/routes', async (req, res) => {
  try {
    const result = await localDb.query('SELECT * FROM routes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

app.listen(port, () => {
  console.log(`Local database API server running at http://localhost:${port}`);
});