// Utility functions for JWT and authentication
import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { config } from './config.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (userId: string, email: string, role: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiry as SignOptions['expiresIn'],
  };

  return jwt.sign({ userId, email, role }, config.jwt.accessSecret, {
    ...options,
  });
};

export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiry as SignOptions['expiresIn'],
  };

  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    ...options,
  });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { userId: string; iat?: number; exp?: number } | null => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as { userId: string; iat?: number; exp?: number };
  } catch {
    return null;
  }
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge,
    path: '/',
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    path: '/',
  });
};
