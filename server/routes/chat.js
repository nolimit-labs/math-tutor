import { Router } from 'express';
import { openai } from '../config/openai.js';
import { pool } from '../db/index.js';

const router = Router();

router.post('/', async (req, res, next) => {
  const { messages } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Math Buddy, a friendly and patient K-5 math tutor. Always explain concepts in simple terms suitable for young students. Use encouraging language and provide step-by-step explanations. Keep responses concise and engaging. If a student seems frustrated, offer encouragement and break down the problem into smaller parts."
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const botMessage = response.choices[0]?.message;
    
    const userMessage = messages[messages.length - 1].content;
    const insertQuery = `
      INSERT INTO conversations (user_message, bot_message)
      VALUES ($1, $2)
      RETURNING id
    `;
    await client.query(insertQuery, [userMessage, botMessage.content]);
    
    await client.query('COMMIT');
    res.json(botMessage);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});