import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { createAuthMiddleware, createProjectAccessMiddleware } from '../middleware/auth';

/**
 * Create project management routes
 * Implements full CRUD operations with proper authentication and authorization
 */
export function createProjectRoutes(prisma: PrismaClient): Router {
  const router = Router();
  
  // Initialize dependencies
  const projectRepository = new ProjectRepository(prisma);
  const projectService = new ProjectService(projectRepository);
  const projectController = new ProjectController(projectService);
  const authMiddleware = createAuthMiddleware(prisma);
  const projectAccessMiddleware = createProjectAccessMiddleware(prisma);

  /**
   * GET /api/v1/projects
   * Get all projects accessible by authenticated user
   * Query params:
   * - type: 'all' (default), 'owned', 'public'
   */
  router.get('/', 
    authMiddleware() as RequestHandler,
    projectController.getProjects as RequestHandler
  );

  /**
   * POST /api/v1/projects
   * Create a new project
   * Body: { name, description?, tempo?, timeSignatureNumerator?, timeSignatureDenominator?, isPublic? }
   */
  router.post('/',
    authMiddleware() as RequestHandler,
    projectController.createProject as RequestHandler
  );

  /**
   * GET /api/v1/projects/:projectId
   * Get project details by ID (requires read access)
   * Query params:
   * - includeDetails: 'true' to include stems and collaborators
   */
  router.get('/:projectId',
    authMiddleware() as RequestHandler,
    projectAccessMiddleware('read') as RequestHandler,
    projectController.getProject as RequestHandler
  );

  /**
   * PUT /api/v1/projects/:projectId
   * Update project (requires write access)
   * Body: { name?, description?, tempo?, timeSignatureNumerator?, timeSignatureDenominator?, length?, isActive?, isPublic? }
   */
  router.put('/:projectId',
    authMiddleware() as RequestHandler,
    projectAccessMiddleware('write') as RequestHandler,
    projectController.updateProject as RequestHandler
  );

  /**
   * DELETE /api/v1/projects/:projectId
   * Delete project (requires admin access - owner only)
   */
  router.delete('/:projectId',
    authMiddleware() as RequestHandler,
    projectAccessMiddleware('admin') as RequestHandler,
    projectController.deleteProject as RequestHandler
  );

  return router;
}
