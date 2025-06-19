import { ProjectService } from '../services/ProjectService';
import { CreateProjectData, UpdateProjectData } from '../repositories/interfaces';
import { AuthenticatedRequest, TypedResponse } from '../types/express';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  /**
   * GET /api/v1/projects
   * Get all projects accessible by the authenticated user
   */
  getProjects = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access projects'
        });
        return;
      }

      const { type = 'all' } = req.query;

      let projects;
      
      switch (type) {
        case 'owned':
          projects = await this.projectService.getOwnedProjects(req.user.id);
          break;
        case 'public':
          projects = await this.projectService.getPublicProjects();
          break;
        case 'all':
        default:
          projects = await this.projectService.getUserProjects(req.user.id);
          break;
      }

      res.json({
        success: true,
        data: projects,
        meta: {
          count: projects.length,
          type: type,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve projects';
      res.status(500).json({
        error: 'Project retrieval failed',
        message
      });
    }
  };

  /**
   * GET /api/v1/projects/:projectId
   * Get project details by ID
   */
  getProject = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access project'
        });
        return;
      }

      const { projectId } = req.params;
      const { includeDetails = 'false' } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      let project;
      
      if (includeDetails === 'true') {
        project = await this.projectService.getProjectWithDetails(projectId);
      } else {
        project = await this.projectService.getProjectById(projectId);
      }

      if (!project) {
        res.status(404).json({
          error: 'Project not found',
          message: 'The specified project does not exist'
        });
        return;
      }

      res.json({
        success: true,
        data: project,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve project';
      res.status(500).json({
        error: 'Project retrieval failed',
        message
      });
    }
  };

  /**
   * POST /api/v1/projects
   * Create a new project
   */
  createProject = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to create a project'
        });
        return;
      }

      // Validate required fields
      const { name } = req.body;
      
      if (!name) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Project name is required'
        });
        return;
      }

      // Extract project data from request body
      const projectData: CreateProjectData = {
        name: name.trim(),
        ownerId: req.user.id,
        description: req.body.description?.trim() || undefined,
        tempo: req.body.tempo || undefined,
        timeSignatureNumerator: req.body.timeSignatureNumerator || undefined,
        timeSignatureDenominator: req.body.timeSignatureDenominator || undefined,
        isPublic: req.body.isPublic || false
      };

      const project = await this.projectService.createProject(projectData);

      res.status(201).json({
        success: true,
        data: project,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      
      // Check if it's a validation error
      if (error instanceof Error && (
        error.message.includes('required') ||
        error.message.includes('must be') ||
        error.message.includes('cannot be')
      )) {
        res.status(400).json({
          error: 'Validation failed',
          message
        });
        return;
      }

      res.status(500).json({
        error: 'Project creation failed',
        message
      });
    }
  };

  /**
   * PUT /api/v1/projects/:projectId
   * Update an existing project
   */
  updateProject = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to update a project'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      // Extract update data from request body
      const updateData: UpdateProjectData = {};

      if (req.body.name !== undefined) {
        updateData.name = req.body.name?.trim();
      }
      if (req.body.description !== undefined) {
        updateData.description = req.body.description?.trim() || null;
      }
      if (req.body.tempo !== undefined) {
        updateData.tempo = req.body.tempo;
      }
      if (req.body.timeSignatureNumerator !== undefined) {
        updateData.timeSignatureNumerator = req.body.timeSignatureNumerator;
      }
      if (req.body.timeSignatureDenominator !== undefined) {
        updateData.timeSignatureDenominator = req.body.timeSignatureDenominator;
      }
      if (req.body.length !== undefined) {
        updateData.length = req.body.length;
      }
      if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive;
      }
      if (req.body.isPublic !== undefined) {
        updateData.isPublic = req.body.isPublic;
      }

      const project = await this.projectService.updateProject(projectId, updateData);

      res.json({
        success: true,
        data: project,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update project';
      
      // Check if it's a validation error
      if (error instanceof Error && (
        error.message.includes('required') ||
        error.message.includes('must be') ||
        error.message.includes('cannot be')
      )) {
        res.status(400).json({
          error: 'Validation failed',
          message
        });
        return;
      }

      res.status(500).json({
        error: 'Project update failed',
        message
      });
    }
  };

  /**
   * DELETE /api/v1/projects/:projectId
   * Delete a project (owner only)
   */
  deleteProject = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to delete a project'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const project = await this.projectService.deleteProject(projectId);

      res.json({
        success: true,
        data: {
          id: project.id,
          name: project.name,
          deletedAt: new Date().toISOString()
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      res.status(500).json({
        error: 'Project deletion failed',
        message
      });
    }
  };
}
