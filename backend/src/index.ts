import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import plannerRouter from './routes/planner.routes';
import type { ApiResponse } from './types/index';

// ─────────────────────────────────────────────────────────────────────────────
// Express Application Setup
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env['PORT'] ?? 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS — allow local development origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' })); // Limit body size for security
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AI Study Planner API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/planner', plannerRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist.',
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────

app.use((err: unknown, _req: Request, res: Response<ApiResponse<never>>, _next: NextFunction) => {
  console.error('[Error]', err);

  if (err instanceof Error) {
    const statusCode = err.message.includes('CORS') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: 'An unexpected error occurred.',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log(`║  🧠 AI Study Planner API                   ║`);
  console.log(`║  Server running on http://localhost:${PORT}   ║`);
  console.log(`║  Environment: ${process.env['NODE_ENV'] ?? 'development'}              ║`);
  console.log('╚════════════════════════════════════════════╝\n');
});

export default app;
