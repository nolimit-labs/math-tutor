import { Router } from 'express';
import { openai } from '../config/openai.js';
import { pool } from '../db/index.js';

const router = Router();

router.post('/', async (req, res) => {
  const { messages, grade, isFirstResponse } = req.body;
  
  try {
    // Define system message based on grade
    const systemMessage = {
      role: "system",
      content: `You are a friendly and encouraging math teacher for Grade ${grade}. 
                Explain concepts clearly and simply, using age-appropriate language. 
                Break down complex problems into smaller steps. 
                Provide positive reinforcement and gentle correction when needed.
                Keep responses concise and focused.`
    };

    // Get chat response
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        systemMessage,
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    // Store conversation in database
    await pool.query(
      'INSERT INTO conversations (user_id, user_message, bot_message, grade) VALUES ($1, $2, $3, $4)',
      [
        req.userId,
        messages[messages.length - 1].content,
        chatResponse.choices[0].message.content,
        grade
      ]
    );

    // Analyze if quiz would be appropriate
    const lastMessages = messages.slice(-3);
    const analysisPrompt = `Analyze these messages and determine if a quiz would be appropriate.
      If yes, identify the specific topic to quiz on.
      
      Messages:
      ${JSON.stringify(lastMessages)}
      
      Consider:
      1. Has a topic been thoroughly discussed?
      2. Has the student demonstrated understanding?
      3. Is this a good moment to test knowledge?
      
      Respond in this exact format (including curly braces):
      {suggestQuiz: true/false, topic: "specific topic"}`;

    const quizAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a math education expert." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent formatting
    });

    // Parse the response manually
    const analysisText = quizAnalysis.choices[0].message.content;
    let analysis;
    try {
      // Extract the JSON-like string and parse it
      const jsonStr = analysisText.match(/\{.*\}/)?.[0];
      analysis = jsonStr ? eval(`(${jsonStr})`) : { suggestQuiz: false };
    } catch (e) {
      console.error('Failed to parse quiz analysis:', e);
      analysis = { suggestQuiz: false };
    }

    const response = {
      content: chatResponse.choices[0].message.content
    };

    // If quiz is suggested, add quiz suggestion
    if (analysis.suggestQuiz) {
      response.quizSuggestion = {
        topic: analysis.topic,
        grade
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

export default router;