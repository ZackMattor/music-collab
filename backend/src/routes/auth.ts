import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthController } from '../controllers/AuthController';
import { 
  createAuthMiddleware, 
  createAuthRateLimiter, 
  validateAuthRequest 
} from '../middleware/auth';

export function createAuthRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const authController = new AuthController(prisma);
  const authMiddleware = createAuthMiddleware(prisma);
  const authRateLimiter = createAuthRateLimiter();

  // Apply rate limiting to all auth routes
  router.use(authRateLimiter);

  /**
   * POST /api/auth/register
   * Register a new user account
   */
  router.post(
    '/register',
    validateAuthRequest(['email', 'displayName', 'password']),
    authController.register
  );

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  router.post(
    '/login',
    validateAuthRequest(['email', 'password']),
    authController.login
  );

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  router.post(
    '/refresh',
    validateAuthRequest(['refreshToken']),
    authController.refreshToken
  );

  /**
   * GET /api/auth/profile
   * Get current user profile (requires authentication)
   */
  router.get(
    '/profile',
    authMiddleware() as RequestHandler,
    authController.getProfile
  );

  /**
   * POST /api/auth/logout
   * Logout user (client-side token invalidation)
   */
  router.post(
    '/logout',
    authController.logout
  );

  /**
   * POST /api/auth/validate
   * Validate a JWT token
   */
  router.post(
    '/validate',
    validateAuthRequest(['token']),
    authController.validateToken
  );

  return router;
}
