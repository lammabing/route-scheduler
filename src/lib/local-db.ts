import { Pool } from 'pg';

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

export const localDb = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  connect: () => pool.connect(),
  end: () => pool.end(),
};