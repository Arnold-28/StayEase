// Input validation middleware
import { Request, Response, NextFunction } from 'express';
import { validate } from '../schemas/validation.js';
import { AppError } from './errorHandler.js';

export const validateRequest = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = validate(req.body, schema);

    if (error) {
      const details = error.details.reduce((acc: any, err: any) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});

      throw new AppError(400, 'Validation error', details);
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = validate(req.query, schema);

    if (error) {
      const details = error.details.reduce((acc: any, err: any) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});

      throw new AppError(400, 'Query validation error', details);
    }

    req.query = value as any;
    next();
  };
};
