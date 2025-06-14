import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index';

export const createSuccessResponse = <T>(
  data: T,
  meta?: Omit<ApiResponse<T>['meta'], 'timestamp'>
): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    ...meta,
    timestamp: new Date().toISOString(),
  },
});

export const createErrorResponse = (
  message: string,
  code?: string,
  details?: Record<string, unknown>
): ApiResponse => ({
  success: false,
  error: {
    message,
    ...(code && { code }),
    ...(details && { details }),
  },
  meta: {
    timestamp: new Date().toISOString(),
  },
});

// Higher-order function that wraps async route handlers to catch errors
// The parameters are used by the function passed to asyncHandler
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
