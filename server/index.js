import express from 'express';
import cors from 'cors';
import { openai } from './config/openai.js';
import { pool } from './db/index.js';
import { router as authRouter } from './routes/auth.js';
import { auth } from './middleware/auth.js';
import chatRouter from './routes/chat.js';
import historyRouter from './routes/history.js';
import path from 'path';
import { fileURLToPath } from 'url';

const port = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Auth routes (unprotected)
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/chat', auth, chatRouter);
app.use('/api/history', auth, historyRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});