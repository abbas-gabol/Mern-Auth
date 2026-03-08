import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './src/routers/auth.route.js';

const app = express();

app.use(helmet());


app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});


app.use('/api/auth', authLimiter, authRoutes);


app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status ?? 500).json({
    message: err.message ?? 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;