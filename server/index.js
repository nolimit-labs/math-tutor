import express from 'express';
import cors from 'cors';
import { openai } from './config/openai.js';
import { pool } from './db/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  const client = await pool.connect();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Math Buddy, a friendly and patient K-5 math tutor. Always explain concepts in simple terms suitable for young students."
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const botMessage = response.choices[0]?.message;
    const userMessage = messages[messages.length - 1].content;
    
    await client.query(
      'INSERT INTO conversations (user_message, bot_message) VALUES ($1, $2)',
      [userMessage, botMessage.content]
    );
    
    res.json(botMessage);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
});

// History endpoint
app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM conversations ORDER BY created_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});