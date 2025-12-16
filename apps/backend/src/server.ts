import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '@modules/auth/auth.route';
import locationRoutes from '@modules/location/location.route';
import { errorHandler } from '@shared/middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:1420',
    'http://localhost:3000',
    'https://geologger-front.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[],
  credentials: true,
}));
app.use(express.json());

app.options('*', cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
