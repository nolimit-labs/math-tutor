import { Router } from 'express';
import { openai } from '../config/openai.js';
import { pool } from '../db/index.js';

const router = Router();

router.post('/', async (req, res, next) => {
  const { messages, grade, isFirstResponse } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const systemMessage = isFirstResponse ? 
      {
        role: "system",
        content: `You are Math Buddy, a patient and encouraging Grade ${grade} math teacher. 
          The student has just indicated they want to begin the lesson.
          
          Your next response should:
          1. Express enthusiasm for teaching
          2. Briefly outline 3-4 key topics you'll cover today
          3. Start with the first topic
          4. Ask an engaging opening question about the first topic
          
          Keep the response friendly and encouraging.
          Use age-appropriate language for Grade ${grade}.
          Make the student feel comfortable and excited to learn.`
      } :
      {
        role: "system",
        content: `You are Math Buddy, a patient and encouraging Grade ${grade} math teacher. 
          Your responses should:
          - Teach grade-appropriate math concepts
          - Use age-appropriate language
          - Provide step-by-step explanations
          - Give practice problems when appropriate
          - Offer hints before solutions
          - Celebrate student success
          - Break down complex problems
          - Use real-world examples
          
          If a student is struggling:
          1. Ask what part they find difficult
          2. Provide a simpler example
          3. Guide them through step by step
          
          Keep responses engaging and encouraging.
          Maintain an appropriate difficulty level for Grade ${grade}.
          Suggest related topics they might want to learn about next.
          
          Remember where you are in the lesson plan you previously outlined.
          Build upon previous concepts as you progress through the topics.`
      };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        systemMessage,
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const botMessage = response.choices[0]?.message;
    
    const userMessage = messages[messages.length - 1].content;
    const insertQuery = `
      INSERT INTO conversations (user_id, user_message, bot_message, grade)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    await client.query(insertQuery, [req.userId, userMessage, botMessage.content, grade]);
    
    await client.query('COMMIT');
    res.json(botMessage);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

export default router;