// Admin Routes – server-side password verification
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../utils/config.js';
import { adminLimiter } from '../middleware/security.js';
import logger from '../utils/logger.js';

const router = Router();

// In-memory lockout tracker (use Redis in production cluster)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Active admin sessions (token → expiry timestamp)
const adminSessions = new Map<string, number>();

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of adminSessions) {
    if (expiry < now) adminSessions.delete(token);
  }
  for (const [ip, data] of failedAttempts) {
    if (data.lockedUntil < now) failedAttempts.delete(ip);
  }
}, 10 * 60 * 1000);

// Admin login – returns a session token
router.post(
  '/login',
  adminLimiter,
  (req: Request, res: Response): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const { password } = req.body;

    // Check lockout
    const attempt = failedAttempts.get(ip);
    if (attempt && attempt.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      logger.warn(`Admin login blocked (lockout) from ${ip}`);
      res.status(429).json({
        error: `Account locked. Try again in ${minutesLeft} minute(s).`,
      });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'Password required' });
      return;
    }

    // Constant-time comparison to prevent timing attacks
    const expected = Buffer.from(config.security.adminSecret);
    const supplied = Buffer.from(password);

    let isValid = false;
    if (expected.length === supplied.length) {
      isValid = crypto.timingSafeEqual(expected, supplied);
    }

    if (!isValid) {
      const current = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      current.count += 1;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        logger.warn(`Admin login lockout triggered for ${ip} after ${current.count} attempts`);
      }

      failedAttempts.set(ip, current);

      logger.warn(`Failed admin login attempt from ${ip} (${current.count}/${MAX_ATTEMPTS})`);
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    // Success – clear failed attempts
    failedAttempts.delete(ip);

    // Generate session token (valid 2 hours)
    const token = crypto.randomBytes(48).toString('hex');
    const expiry = Date.now() + 2 * 60 * 60 * 1000;
    adminSessions.set(token, expiry);

    logger.info(`Admin login success from ${ip}`);

    res.json({ token, expiresAt: new Date(expiry).toISOString() });
  }
);

// Verify admin session
router.post(
  '/verify',
  (req: Request, res: Response): void => {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(401).json({ valid: false });
      return;
    }

    const expiry = adminSessions.get(token);
    if (!expiry || expiry < Date.now()) {
      adminSessions.delete(token);
      res.status(401).json({ valid: false });
      return;
    }

    res.json({ valid: true });
  }
);

// Admin logout
router.post(
  '/logout',
  (req: Request, res: Response): void => {
    const { token } = req.body;
    if (token) adminSessions.delete(token);
    res.json({ message: 'Logged out' });
  }
);

export default router;
