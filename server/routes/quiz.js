import { Router } from 'express';
import { pool } from '../db/index.js';
import { auth } from '../middleware/auth.js';
import { openai } from '../config/openai.js';

const router = Router();

router.get('/topics/:grade', auth, async (req, res) => {
  try {
    const { grade } = req.params;
    const result = await pool.query(
      'SELECT DISTINCT topic FROM quizzes WHERE grade = $1',
      [grade]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

router.post('/start', auth, async (req, res) => {
  const { topic, grade } = req.body;
  
  try {
    // Get quiz for topic and grade
    const quizResult = await pool.query(
      'SELECT * FROM quizzes WHERE topic = $1 AND grade = $2 LIMIT 1',
      [topic, grade]
    );
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const quiz = quizResult.rows[0];
    
    // Get questions for quiz
    const questionsResult = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1',
      [quiz.id]
    );
    
    res.json({
      id: quiz.id,
      topic: quiz.topic,
      questions: questionsResult.rows.map(q => ({
        ...q,
        options: q.options
      }))
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

router.post('/submit', auth, async (req, res) => {
  const { quizId, answers } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get correct answers
    const questionsResult = await client.query(
      'SELECT id, correct_answer, points FROM quiz_questions WHERE quiz_id = $1',
      [quizId]
    );
    
    // Calculate score
    let score = 0;
    let total = 0;
    
    questionsResult.rows.forEach(question => {
      total += question.points;
      if (answers[question.id] === question.correct_answer) {
        score += question.points;
      }
    });
    
    // Save attempt
    await client.query(
      'INSERT INTO user_quiz_attempts (user_id, quiz_id, score) VALUES ($1, $2, $3)',
      [req.userId, quizId, score]
    );
    
    await client.query('COMMIT');
    
    res.json({
      score,
      total,
      feedback: `You scored ${score} out of ${total} points!`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  } finally {
    client.release();
  }
});

router.post('/generate', auth, async (req, res) => {
  const { grade } = req.body;
  
  try {
    // Generate questions using OpenAI
    const prompt = `Generate 5 multiple choice math questions for grade ${grade}.
      Questions should be based on grade-appropriate topics.
      Format as JSON array with structure:
      {
        "questions": [{
          "question": "question text",
          "options": ["option1", "option2", "option3", "option4"],
          "correct_answer": "correct option",
          "explanation": "explanation of answer"
        }]
      }
      Ensure questions are grade-appropriate and clear.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a math education expert." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const questions = JSON.parse(completion.choices[0].message.content).questions;
    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router; 