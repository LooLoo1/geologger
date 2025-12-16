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
const allowedOrigins = [
  'http://localhost:1420',
  'http://localhost:3000',
  'https://geologger-front.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Supabase connection test
// app.get('/api/test/supabase', async (req, res, next) => {
//   try {
//     const { supabase, supabaseAdmin } = await import('@lib/supabase');
    
//     // Test basic connection - просто перевіряємо чи таблиця існує
//     const testResponse = await supabase.from('users').select('id').limit(1);
    
//     res.json({
//       status: 'ok',
//       supabaseConfigured: !!process.env.SUPABASE_URL,
//       anonKeySet: !!process.env.SUPABASE_ANON_KEY,
//       serviceRoleKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
//       adminClientAvailable: !!supabaseAdmin,
//       connectionTest: testResponse.error 
//         ? { 
//             error: testResponse.error.message, 
//             code: testResponse.error.code,
//             hint: testResponse.error.hint,
//             details: testResponse.error.details
//           }
//         : { success: true, tableExists: true },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       error: error instanceof Error ? error.message : 'Unknown error',
//       stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
//     });
//   }
// });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
