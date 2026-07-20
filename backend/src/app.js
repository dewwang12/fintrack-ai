const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const globalErrorHandler = require('./middlewares/error.middleware');
const AppError = require('./utils/AppError');

const app = express();

// 1. Enable Security HTTP headers
app.use(helmet());

// 2. Configure Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser / server-to-server requests (no origin) or allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in deployment to avoid CORS blocking live links
    }
  },
  credentials: true, // Allow cookies to be sent along with HTTP requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. Parse JSON payloads (capped at 10kb to prevent massive payloads slowing down node thread)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Parse incoming cookies (vital for reading Refresh Token)
app.use(cookieParser());

// Health check endpoints for cloud monitoring (Render / Railway)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FinTrack AI API is live' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 5. Mount API version 1 gateway
app.use('/api/v1', routes);

// 6. Catch-all route handler for undefined routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// 7. Register Global Error Handler Middleware
app.use(globalErrorHandler);

module.exports = app;
