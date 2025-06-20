import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';
import { UserRepository } from '../repositories/UserRepository';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';

export interface AuthMiddlewareOptions {
  optional?: boolean; // If true, don't throw error if no token
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
export function createAuthMiddleware(prisma: PrismaClient) {
  const userRepository = new UserRepository(prisma);
  const authService = new AuthService(userRepository);

  return (options: AuthMiddlewareOptions = {}) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          if (options.optional) {
            return next();
          }
          res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid access token'
          });
          return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token and get user
        const user = await authService.getUserFromToken(token);

        // Attach user to request object (exclude sensitive data)
        req.user = {
          id: user.id,
          email: user.email,
          displayName: user.displayName || 'Anonymous',
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        next();
      } catch (error) {
        if (options.optional) {
          return next();
        }

        const message = error instanceof Error ? error.message : 'Authentication failed';
        res.status(401).json({
          error: 'Authentication failed',
          message
        });
      }
    };
  };
}

/**
 * Role-based authorization middleware
 * Checks if user has required permissions for project operations
 */
export function createProjectAccessMiddleware(prisma: PrismaClient) {
  return (permission: 'read' | 'write' | 'admin') => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            error: 'Authentication required',
            message: 'User must be authenticated to access this resource'
          });
          return;
        }

        const projectId = req.params.projectId || req.body.projectId;
        
        if (!projectId) {
          res.status(400).json({
            error: 'Project ID required',
            message: 'Project ID must be provided in URL parameters or request body'
          });
          return;
        }

        // Check if project exists
        const project = await prisma.project.findUnique({
          where: { id: projectId }
        });

        if (!project) {
          res.status(404).json({
            error: 'Project not found',
            message: 'The specified project does not exist'
          });
          return;
        }

        // Check if user is the project owner (has all permissions)
        if (project.ownerId === req.user.id) {
          return next();
        }

        // Check if user is a collaborator with appropriate permissions
        const collaborator = await prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: projectId,
              userId: req.user.id
            }
          }
        });

        if (!collaborator) {
          res.status(403).json({
            error: 'Access denied',
            message: 'You do not have access to this project'
          });
          return;
        }

        // Check permission level
        const hasPermission = checkPermissionLevel(collaborator.role, permission);
        
        if (!hasPermission) {
          res.status(403).json({
            error: 'Insufficient permissions',
            message: `You need ${permission} permission to perform this action`
          });
          return;
        }

        next();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Authorization failed';
        res.status(403).json({
          error: 'Authorization failed',
          message
        });
      }
    };
  };
}

/**
 * Helper function to check if a role has the required permission level
 */
function checkPermissionLevel(userRole: string, requiredPermission: 'read' | 'write' | 'admin'): boolean {
  const roleHierarchy = {
    'VIEWER': ['read'],
    'COLLABORATOR': ['read', 'write'],
    'ADMIN': ['read', 'write', 'admin']
  };

  const userPermissions = roleHierarchy[userRole as keyof typeof roleHierarchy] || [];
  return userPermissions.includes(requiredPermission);
}

/**
 * @deprecated Use createProjectAccessMiddleware instead
 * Legacy function maintained for backward compatibility
 */
export function requireProjectAccess(_permission: 'read' | 'write' | 'admin') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access this resource'
        });
        return;
      }

      const projectId = req.params.projectId || req.body.projectId;
      
      if (!projectId) {
        res.status(400).json({
          error: 'Project ID required',
          message: 'Project ID must be provided in URL parameters or request body'
        });
        return;
      }

      // Legacy implementation - just check if user exists
      // Use createProjectAccessMiddleware for proper permission checking
      
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authorization failed';
      res.status(403).json({
        error: 'Authorization failed',
        message
      });
    }
  };
}

/**
 * Rate limiting middleware for authentication endpoints
 */
export function createAuthRateLimiter() {
  // Skip rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return (req: Request, res: Response, next: NextFunction): void => {
      next();
    };
  }

  // Using a simple in-memory rate limiter for now
  // In production, use Redis-based rate limiting
  const attempts = new Map<string, { count: number; resetTime: number }>();
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [ip, data] of attempts.entries()) {
      if (now > data.resetTime) {
        attempts.delete(ip);
      }
    }

    const clientAttempts = attempts.get(clientIP);
    
    if (!clientAttempts) {
      attempts.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientAttempts.count >= maxAttempts) {
      res.status(429).json({
        error: 'Too many attempts',
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil((clientAttempts.resetTime - now) / 1000)
      });
      return;
    }

    clientAttempts.count++;
    next();
  };
}

/**
 * Middleware to validate request body for authentication endpoints
 */
export function validateAuthRequest(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Missing required fields',
        message: `The following fields are required: ${missingFields.join(', ')}`,
        missingFields
      });
      return;
    }

    // Basic input sanitization
    for (const field of requiredFields) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    }

    next();
  };
}
