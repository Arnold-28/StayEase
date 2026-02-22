// Security middleware
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '../utils/config.js';
import logger from '../utils/logger.js';

// ─── Request ID tracking ───────────────────────
export const requestId = (req: Request, _res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
  next();
};

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(config.security.corsOrigin ? [config.security.corsOrigin] : []),
];

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});

// Rate limiting
export const generalLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window (strict for auth)
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for admin routes
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many admin attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later.',
  skipSuccessfulRequests: false,
});

// CSRF Protection – double-submit cookie pattern
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Generate token on GET/HEAD/OPTIONS and set as cookie
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', token, {
      httpOnly: false, // client must read it
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.locals.csrfToken = token;
    next();
    return;
  }

  // Validate on mutating requests
  const cookieToken = req.cookies?.['csrf-token'];
  const headerToken = req.headers['x-csrf-token'] as string;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    logger.warn(`CSRF validation failed for ${req.method} ${req.path} from ${req.ip}`);
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }
  next();
};

// Helmet with enhanced security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", config.apiUrl],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: config.env === 'production' ? [] : undefined,
    },
  },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  dnsPrefetchControl: { allow: false },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
});

// Additional security headers not covered by Helmet
export const extraSecurityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.removeHeader('X-Powered-By');
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });
  next();
};

// XSS Protection - Sanitize inputs (deep, recursive)
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: unknown): unknown => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      const value = (obj as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        // Comprehensive XSS pattern removal
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<\s*\/?(script|iframe|object|embed|applet|form|input|link|meta|style)[^>]*>/gi, '')
          .replace(/on\w+\s*=\s*(['"]?).*?\1/gi, '')
          .replace(/javascript\s*:/gi, '')
          .replace(/vbscript\s*:/gi, '')
          .replace(/data\s*:\s*text\/html/gi, '')
          .replace(/expression\s*\(/gi, '')
          .replace(/url\s*\(\s*['"]?\s*javascript/gi, '')
          .replace(/\x00/g, ''); // null byte injection
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  };

  req.body = sanitize(req.body) as Request['body'];
  req.query = sanitize(req.query) as Request['query'];
  req.params = sanitize(req.params) as Request['params'];
  next();
};

// Parameter pollution protection
export const parameterPollutionProtection = (req: Request, _res: Response, next: NextFunction) => {
  // If any query param is an array, keep only the last value
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      const arr = req.query[key] as string[];
      (req.query as Record<string, unknown>)[key] = arr[arr.length - 1];
    }
  }
  next();
};
