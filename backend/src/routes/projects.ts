import { Router } from 'express';
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
    authMiddleware() as any,
    projectController.getProjects as any
  );

  /**
   * POST /api/v1/projects
   * Create a new project
   * Body: { name, description?, tempo?, timeSignatureNumerator?, timeSignatureDenominator?, isPublic? }
   */
  router.post('/',
    authMiddleware() as any,
    projectController.createProject as any
  );

  /**
   * GET /api/v1/projects/:projectId
   * Get project details by ID (requires read access)
   * Query params:
   * - includeDetails: 'true' to include stems and collaborators
   */
  router.get('/:projectId',
    authMiddleware() as any,
    projectAccessMiddleware('read') as any,
    projectController.getProject as any
  );

  /**
   * PUT /api/v1/projects/:projectId
   * Update project (requires write access)
   * Body: { name?, description?, tempo?, timeSignatureNumerator?, timeSignatureDenominator?, length?, isActive?, isPublic? }
   */
  router.put('/:projectId',
    authMiddleware() as any,
    projectAccessMiddleware('write') as any,
    projectController.updateProject as any
  );

  /**
   * DELETE /api/v1/projects/:projectId
   * Delete project (requires admin access - owner only)
   */
  router.delete('/:projectId',
    authMiddleware() as any,
    projectAccessMiddleware('admin') as any,
    projectController.deleteProject as any
  );

  return router;
}
