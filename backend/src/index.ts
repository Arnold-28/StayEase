// Application Entry Point
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import app from './app.js';
import { config } from './utils/config.js';
import logger from './utils/logger.js';

const prisma = new PrismaClient();
const PORT = config.port;

// Graceful Shutdown Handler
const gracefulShutdown = () => {
  logger.info('Graceful shutdown initiated');

  const shutdownTimeout = setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  prisma.$disconnect().then(() => {
    clearTimeout(shutdownTimeout);
    logger.info('Prisma disconnected');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${config.env} mode`);
  logger.info(`API URL: ${config.apiUrl}`);
});

export default server;
