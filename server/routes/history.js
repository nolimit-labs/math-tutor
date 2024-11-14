import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM conversations 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;