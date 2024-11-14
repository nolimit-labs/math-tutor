import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Database schema
const schema = `
  CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_message TEXT NOT NULL,
    bot_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize database
export async function initDB() {
  try {
    await pool.query(schema);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Initialize DB when this module is imported
initDB();