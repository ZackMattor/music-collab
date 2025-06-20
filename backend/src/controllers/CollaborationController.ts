import { CollaborationService } from '../services/CollaborationService';
import { AuthenticatedRequest, TypedResponse } from '../types/express';
import { Role } from '@prisma/client';

export class CollaborationController {
  constructor(private collaborationService: CollaborationService) {}

  /**
   * POST /api/v1/projects/:projectId/collaborators/invite
   * Invite a user to collaborate on a project
   */
  inviteCollaborator = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to invite collaborators'
        });
        return;
      }

      const { projectId } = req.params;
      const { email, role = 'CONTRIBUTOR', permissions } = req.body;

      if (!projectId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Project ID is required'
        });
        return;
      }

      if (!email) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Email is required to invite a collaborator'
        });
        return;
      }

      // Validate role
      if (!Object.values(Role).includes(role)) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid role. Must be VIEWER, CONTRIBUTOR, or ADMIN'
        });
        return;
      }

      const result = await this.collaborationService.inviteCollaborator(
        projectId,
        req.user.id,
        email,
        role,
        permissions
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Collaborator invitation sent successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to invite collaborator';
      
      if (message.includes('not found') || message.includes('does not exist')) {
        res.status(404).json({ error: 'Not found', message });
      } else if (message.includes('permission') || message.includes('access')) {
        res.status(403).json({ error: 'Access denied', message });
      } else if (message.includes('already a collaborator')) {
        res.status(409).json({ error: 'Conflict', message });
      } else {
        res.status(500).json({ error: 'Internal server error', message });
      }
    }
  };

  /**
   * GET /api/v1/projects/:projectId/collaborators
   * Get all collaborators for a project
   */
  getCollaborators = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to view collaborators'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Project ID is required'
        });
        return;
      }

      const collaborators = await this.collaborationService.getProjectCollaborators(
        projectId,
        req.user.id
      );

      res.json({
        success: true,
        data: collaborators,
        meta: {
          count: collaborators.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get collaborators';
      
      if (message.includes('not found') || message.includes('does not exist')) {
        res.status(404).json({ error: 'Not found', message });
      } else if (message.includes('permission') || message.includes('access')) {
        res.status(403).json({ error: 'Access denied', message });
      } else {
        res.status(500).json({ error: 'Internal server error', message });
      }
    }
  };

  /**
   * PUT /api/v1/projects/:projectId/collaborators/:userId
   * Update a collaborator's role and permissions
   */
  updateCollaborator = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to update collaborators'
        });
        return;
      }

      const { projectId, userId } = req.params;
      const { role, permissions } = req.body;

      if (!projectId || !userId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Project ID and User ID are required'
        });
        return;
      }

      // Validate role if provided
      if (role && !Object.values(Role).includes(role)) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid role. Must be VIEWER, CONTRIBUTOR, or ADMIN'
        });
        return;
      }

      const updatedCollaborator = await this.collaborationService.updateCollaborator(
        projectId,
        req.user.id,
        userId,
        { role, permissions }
      );

      res.json({
        success: true,
        data: updatedCollaborator,
        message: 'Collaborator updated successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update collaborator';
      
      if (message.includes('not found') || message.includes('does not exist')) {
        res.status(404).json({ error: 'Not found', message });
      } else if (message.includes('permission') || message.includes('access')) {
        res.status(403).json({ error: 'Access denied', message });
      } else {
        res.status(500).json({ error: 'Internal server error', message });
      }
    }
  };

  /**
   * DELETE /api/v1/projects/:projectId/collaborators/:userId
   * Remove a collaborator from a project
   */
  removeCollaborator = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to remove collaborators'
        });
        return;
      }

      const { projectId, userId } = req.params;

      if (!projectId || !userId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Project ID and User ID are required'
        });
        return;
      }

      await this.collaborationService.removeCollaborator(
        projectId,
        req.user.id,
        userId
      );

      res.json({
        success: true,
        message: 'Collaborator removed successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove collaborator';
      
      if (message.includes('not found') || message.includes('does not exist')) {
        res.status(404).json({ error: 'Not found', message });
      } else if (message.includes('permission') || message.includes('access')) {
        res.status(403).json({ error: 'Access denied', message });
      } else {
        res.status(500).json({ error: 'Internal server error', message });
      }
    }
  };

  /**
   * POST /api/v1/projects/:projectId/collaborators/:userId/leave
   * Leave a project as a collaborator
   */
  leaveProject = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to leave project'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Project ID is required'
        });
        return;
      }

      await this.collaborationService.leaveProject(projectId, req.user.id);

      res.json({
        success: true,
        message: 'Successfully left the project'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to leave project';
      
      if (message.includes('not found') || message.includes('does not exist')) {
        res.status(404).json({ error: 'Not found', message });
      } else if (message.includes('permission') || message.includes('access')) {
        res.status(403).json({ error: 'Access denied', message });
      } else {
        res.status(500).json({ error: 'Internal server error', message });
      }
    }
  };

  /**
   * GET /api/v1/projects/:projectId/collaborators/:userId/permissions
   * Get a collaborator's permissions for a project
   */
  getCollaboratorPermissions = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to view permissions'
        });
        return;
      }

      const { projectId, userId } = req.params;

      if (!projectId || !userId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Project ID and User ID are required'
        });
        return;
      }

      const permissions = await this.collaborationService.getCollaboratorPermissions(
        projectId,
        req.user.id,
        userId
      );

      res.json({
        success: true,
        data: permissions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get permissions';
      
      if (message.includes('not found') || message.includes('does not exist')) {
        res.status(404).json({ error: 'Not found', message });
      } else if (message.includes('permission') || message.includes('access')) {
        res.status(403).json({ error: 'Access denied', message });
      } else {
        res.status(500).json({ error: 'Internal server error', message });
      }
    }
  };
}
