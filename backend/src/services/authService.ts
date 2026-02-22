// Authentication Service
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import { config } from '../utils/config.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'GUEST' | 'OWNER';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  });

  if (existingUser) {
    throw new AppError(409, 'User already exists with this email or username');
  }

  // Hash password with bcrypt (configurable rounds)
  const passwordHash = await bcrypt.hash(input.password, config.security.bcryptRounds);

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: input.role || 'GUEST',
        isActive: true,
      },
    });

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User registered: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error(`Registration failed: ${error}`);
    throw new AppError(500, 'Registration failed');
  }
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordValid) {
    logger.warn(`Failed login attempt for user: ${input.email}`);
    throw new AppError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  logger.info(`User logged in: ${user.id}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  try {
    const { verifyRefreshToken } = await import('../utils/auth.js');
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new AppError(401, 'Invalid refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'User not found or inactive');
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);

    return { accessToken };
  } catch (error) {
    logger.error(`Token refresh failed: ${error}`);
    throw new AppError(401, 'Failed to refresh token');
  }
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const passwordValid = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!passwordValid) {
    throw new AppError(401, 'Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  logger.info(`Password changed for user: ${userId}`);
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};
