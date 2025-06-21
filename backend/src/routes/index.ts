import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAuthRoutes } from './auth';
import { createUserRoutes } from './users';
import { createProjectRoutes } from './projects';
import { createCollaborationRoutes } from './collaboration';
import { createStemRoutes } from './stems';

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
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        projects: '/api/v1/projects',
        stems: '/api/v1/stems',
        tracks: '/api/v1/tracks',
        collaborations: '/api/v1/collaborations',
      },
    });
  });

  // Authentication routes
  router.use('/auth', createAuthRoutes(prisma));

  // User management routes
  router.use('/users', createUserRoutes(prisma));

  // Project management routes
  router.use('/projects', createProjectRoutes(prisma));

  // Collaboration management routes (nested under projects)
  router.use('/projects', createCollaborationRoutes(prisma));

  // Stem management routes
  router.use('/', createStemRoutes(prisma));

  router.use('/tracks', (req, res) => {
    res.json({ message: 'Track management endpoints - Coming soon' });
  });

  router.use('/collaborations', (req, res) => {
    res.json({ message: 'Collaboration endpoints - Coming soon' });
  });

  return router;
}
