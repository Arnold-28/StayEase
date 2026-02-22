// Error handling middleware
import { Request, Response, NextFunction } from 'express';
import { config } from '../utils/config.js';
import logger from '../utils/logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  // Always log full error server-side
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.headers['x-request-id'],
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle JWT errors — generic message, no internals leaked
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Authentication failed',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle validation errors
  if (err.details) {
    res.status(400).json({
      error: 'Validation error',
      details: err.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Default: never leak stack/error details in production
  res.status(500).json({
    error: config.env === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
