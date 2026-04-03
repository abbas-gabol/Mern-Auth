import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import app from './app.js';
import connectDB from './src/config/database.js';

// Connect to DB on cold start
connectDB().catch(err => {
  console.error('DB connection failed', err);
});

export default app; // ← Vercel needs this instead of app.listen()