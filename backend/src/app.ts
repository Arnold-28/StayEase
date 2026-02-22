// Main Express Application
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { config } from './utils/config.js';
import {
  helmetConfig,
  extraSecurityHeaders,
  corsConfig,
  generalLimiter,
  requestLogger,
  requestId,
  sanitizeInputs,
  parameterPollutionProtection,
} from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import propertyRoutes from './routes/properties.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import qrCodeRoutes from './routes/qrCodes.js';
import reviewRoutes from './routes/reviews.js';

const app = express();

// Disable fingerprinting headers
app.disable('x-powered-by');
app.disable('etag');

// Trust proxy for correct IP in X-Forwarded-For
app.set('trust proxy', 1);

// Request ID tracking
app.use(requestId);

// Security Middleware
app.use(helmetConfig);
app.use(extraSecurityHeaders);
app.use(corsConfig);

// Request Logging
app.use(requestLogger);

// Body Parsing – keep limits tight to prevent DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: false }));
app.use(cookieParser(config.security.sessionSecret));

// Input Sanitization & pollution protection
app.use(sanitizeInputs);
app.use(parameterPollutionProtection);

// Rate Limiting
app.use(generalLimiter);

// Health Check (minimal – no env/version leak)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 Handler – don't leak path/method info
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
