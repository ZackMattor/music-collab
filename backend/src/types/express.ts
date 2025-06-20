import { Request, Response } from 'express';

// Authenticated user interface
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Authenticated request interface
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Typed response interface that allows both success and error responses
export interface TypedResponse<T = unknown> extends Response {
  json: (body: T | ApiResponse<T> | ApiErrorResponse) => this;
}

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    count?: number;
    type?: string;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}
