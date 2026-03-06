import express from 'express';
//import authRoutes from './src/routers/auth.route.js';

const app=express();

app.use(express.json());

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

export default app;

/*Flow of your app

Request comes to server

express.json() parses body

/api/auth routes are checked

If no route matches → 404 handler runs*/