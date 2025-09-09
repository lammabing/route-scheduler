const { Pool } = require('pg');

// Local PostgreSQL connection details
const localDbConfig = {
  connectionString: 'postgresql://postgres:postgres@localhost:5433/postgres'
};

const pool = new Pool(localDbConfig);

async function insertMockData() {
  // Dynamically import uuid
  const { v4: uuidv4 } = await import('uuid');
  
  const client = await pool.connect();
  
  try {
    // Insert mock data for fares
    const schedulesResult = await client.query('SELECT id FROM schedules');
    const scheduleIds = schedulesResult.rows.map(row => row.id);
    
    for (const scheduleId of scheduleIds) {
      await client.query(`
        INSERT INTO fares (id, schedule_id, name, fare_type, price, currency, description) VALUES 
        ($1, $2, 'Standard', 'standard', 3.50, 'USD', 'Regular adult fare'),
        ($3, $2, 'Concession', 'concession', 1.75, 'USD', 'Discount fare for eligible concession holders'),
        ($4, $2, 'Student', 'student', 2.00, 'USD', 'Valid student ID required'),
        ($5, $2, 'Senior/Disability', 'senior', 1.50, 'USD', 'For seniors and disability card holders'),
        ($6, $2, 'Child', 'child', 1.00, 'USD', 'For children aged 5-15'),
        ($7, $2, 'Day Pass', 'other', 8.50, 'USD', 'Unlimited travel for one day')
        ON CONFLICT DO NOTHING
      `, [
        uuidv4(),
        scheduleId,
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4(),
        uuidv4()
      ]);
    }
    
    // Insert mock data for departure_times
    for (const scheduleId of scheduleIds) {
      const departureTimeIds = [];
      for (let i = 0; i < 12; i++) {
        const id = uuidv4();
        departureTimeIds.push(id);
        await client.query(`
          INSERT INTO departure_times (id, schedule_id, time) VALUES 
          ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [id, scheduleId, `${8 + i}:00`]);
      }
    }
    
    // Insert mock data for departure_time_infos
    const departureTimesResult = await client.query('SELECT id FROM departure_times');
    const departureTimeIds = departureTimesResult.rows.map(row => row.id);
    
    for (const departureTimeId of departureTimeIds) {
      // Randomly assign some time info to departure times
      const shouldAssignInfo = Math.random() > 0.7; // 30% chance
      if (shouldAssignInfo) {
        const timeInfoId = ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)];
        await client.query(`
          INSERT INTO departure_time_infos (id, departure_time_id, time_info_id) VALUES 
          ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [uuidv4(), departureTimeId, timeInfoId]);
      }
    }
    
    // Insert mock data for departure_time_fares
    const faresResult = await client.query('SELECT id FROM fares');
    const fareIds = faresResult.rows.map(row => row.id);
    
    for (const departureTimeId of departureTimeIds) {
      // Randomly assign some fares to departure times
      const shouldAssignFare = Math.random() > 0.5; // 50% chance
      if (shouldAssignFare && fareIds.length > 0) {
        const randomFareId = fareIds[Math.floor(Math.random() * fareIds.length)];
        await client.query(`
          INSERT INTO departure_time_fares (id, departure_time_id, fare_id) VALUES 
          ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [uuidv4(), departureTimeId, randomFareId]);
      }
    }
    
    console.log('Mock data inserted successfully!');
  } catch (error) {
    console.error('Error inserting mock data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

insertMockData();