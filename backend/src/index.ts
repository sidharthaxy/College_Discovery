import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // standard Vite dev ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

import collegesRouter from './routes/colleges';
app.use('/api/colleges', collegesRouter);

import reviewsRouter from './routes/reviews';
app.use('/api/reviews', reviewsRouter);

import predictRouter from './routes/predict';
app.use('/api/predict', predictRouter);

import adminRouter from './routes/admin';
app.use('/api/admin', adminRouter);

// Health Check / Diagnostics
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'College Discovery Platform API is running.'
  });
});

// Database connectivity check
app.get('/api/health', async (req, res) => {
  try {
    // Basic ping to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected'
    });
  } catch (error: any) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message || 'Database connection error'
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
