import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserController } from '../controllers/UserController';
import { UserRepository } from '../repositories/UserRepository';
import { createAuthMiddleware } from '../middleware/auth';

/**
 * Create user management routes
 * All routes require authentication
 */
export function createUserRoutes(prisma: PrismaClient): Router {
  const router = Router();
  
  // Initialize dependencies
  const userRepository = new UserRepository(prisma);
  const userController = new UserController(userRepository);
  const authMiddleware = createAuthMiddleware(prisma);

  // Apply authentication middleware to all user routes
  router.use(authMiddleware());

  /**
   * GET /api/v1/users/profile
   * Get current user's extended profile
   */
  router.get('/profile', userController.getProfile);

  /**
   * PUT /api/v1/users/profile  
   * Update current user's profile (displayName, avatar)
   */
  router.put('/profile', userController.updateProfile);

  /**
   * GET /api/v1/users/preferences
   * Get current user's preferences (tempo, notifications)
   */
  router.get('/preferences', userController.getPreferences);

  /**
   * PUT /api/v1/users/preferences
   * Update current user's preferences
   */
  router.put('/preferences', userController.updatePreferences);

  /**
   * PUT /api/v1/users/avatar
   * Update current user's avatar URL
   */
  router.put('/avatar', userController.updateAvatar);

  /**
   * DELETE /api/v1/users/account
   * Delete current user's account (requires password confirmation)
   */
  router.delete('/account', userController.deleteAccount);

  return router;
}
