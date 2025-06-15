import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAuthRoutes } from './auth';

export function createApiRoutes(prisma: PrismaClient): Router {
  const router = Router();

  // API version info
  router.get('/', (req, res) => {
    res.json({
      message: 'Music Collaboration Platform API',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        users: '/api/users',
        projects: '/api/projects',
        tracks: '/api/tracks',
        collaborations: '/api/collaborations',
      },
    });
  });

  // Authentication routes
  router.use('/auth', createAuthRoutes(prisma));

  // Placeholder routes for future implementation
  router.use('/users', (req, res) => {
    res.json({ message: 'User management endpoints - Coming soon' });
  });

  router.use('/projects', (req, res) => {
    res.json({ message: 'Project management endpoints - Coming soon' });
  });

  router.use('/tracks', (req, res) => {
    res.json({ message: 'Track management endpoints - Coming soon' });
  });

  router.use('/collaborations', (req, res) => {
    res.json({ message: 'Collaboration endpoints - Coming soon' });
  });

  return router;
}
