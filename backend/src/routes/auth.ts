// Authentication Routes
import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { authSchemas } from '../schemas/validation.js';
import { authLimiter } from '../middleware/security.js';
import * as authService from '../services/authService.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/auth.js';

const router = Router();

// Register
router.post(
  '/register',
  authLimiter,
  validateRequest(authSchemas.register),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      user: result.user,
      accessToken: result.accessToken,
    });
  })
);

// Login
router.post(
  '/login',
  authLimiter,
  validateRequest(authSchemas.login),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
    });
  })
);

// Refresh Token
router.post(
  '/refresh',
  validateRequest(authSchemas.refreshToken),
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      accessToken: result.accessToken,
      message: 'Token refreshed successfully',
    });
  })
);

// Logout
router.post('/logout', (_req: AuthenticatedRequest, res: Response) => {
  clearRefreshTokenCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Get Current User
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await authService.getUserById(req.user!.userId);
    res.json(user);
  })
);

// Change Password
router.post(
  '/change-password',
  authenticate,
  validateRequest(authSchemas.updatePassword),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await authService.changePassword(
      req.user!.userId,
      req.body.oldPassword,
      req.body.newPassword
    );
    res.json({ message: 'Password changed successfully' });
  })
);

export default router;
