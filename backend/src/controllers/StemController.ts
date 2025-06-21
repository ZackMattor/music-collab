import { StemService } from '../services/StemService';
import { CreateStemData, UpdateStemData } from '../repositories/interfaces';
import { AuthenticatedRequest, TypedResponse } from '../types/express';

export class StemController {
  constructor(private stemService: StemService) {}

  /**
   * GET /api/v1/projects/:projectId/stems
   * Get all stems for a project
   */
  getProjectStems = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access stems'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          error: 'Project ID required',
          message: 'Project ID must be provided in URL parameters'
        });
        return;
      }

      const stems = await this.stemService.getProjectStems(projectId, req.user.id);

      res.json({
        success: true,
        data: stems,
        message: `Retrieved ${stems.length} stems for project`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve stems';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 500;

      res.status(statusCode).json({
        error: 'Stem retrieval failed',
        message
      });
    }
  };

  /**
   * GET /api/v1/stems/:stemId
   * Get a specific stem by ID
   */
  getStemById = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access stems'
        });
        return;
      }

      const { stemId } = req.params;
      const { withSegments } = req.query;

      if (!stemId) {
        res.status(400).json({
          error: 'Stem ID required',
          message: 'Stem ID must be provided in URL parameters'
        });
        return;
      }

      let stem;
      if (withSegments === 'true') {
        stem = await this.stemService.getStemWithSegments(stemId, req.user.id);
      } else {
        stem = await this.stemService.getStemById(stemId, req.user.id);
      }

      if (!stem) {
        res.status(404).json({
          error: 'Stem not found',
          message: 'The specified stem does not exist or you do not have access to it'
        });
        return;
      }

      res.json({
        success: true,
        data: stem,
        message: 'Stem retrieved successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve stem';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 500;

      res.status(statusCode).json({
        error: 'Stem retrieval failed',
        message
      });
    }
  };

  /**
   * POST /api/v1/projects/:projectId/stems
   * Create a new stem
   */
  createStem = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to create stems'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          error: 'Project ID required',
          message: 'Project ID must be provided in URL parameters'
        });
        return;
      }

      // Validate required fields
      const { name } = req.body;
      if (!name) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Stem name is required'
        });
        return;
      }

      const stemData: CreateStemData = {
        projectId,
        name: name.trim(),
        color: req.body.color,
        volume: req.body.volume,
        pan: req.body.pan,
        instrumentType: req.body.instrumentType,
        midiChannel: req.body.midiChannel,
        order: req.body.order,
        lastModifiedBy: req.user.id
      };

      const stem = await this.stemService.createStem(stemData, req.user.id);

      res.status(201).json({
        success: true,
        data: stem,
        message: 'Stem created successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create stem';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 400;

      res.status(statusCode).json({
        error: 'Stem creation failed',
        message
      });
    }
  };

  /**
   * PUT /api/v1/stems/:stemId
   * Update an existing stem
   */
  updateStem = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to update stems'
        });
        return;
      }

      const { stemId } = req.params;

      if (!stemId) {
        res.status(400).json({
          error: 'Stem ID required',
          message: 'Stem ID must be provided in URL parameters'
        });
        return;
      }

      const updateData: UpdateStemData = {};

      // Only update provided fields
      if (req.body.name !== undefined) updateData.name = req.body.name.trim();
      if (req.body.color !== undefined) updateData.color = req.body.color;
      if (req.body.volume !== undefined) updateData.volume = req.body.volume;
      if (req.body.pan !== undefined) updateData.pan = req.body.pan;
      if (req.body.isMuted !== undefined) updateData.isMuted = req.body.isMuted;
      if (req.body.isSoloed !== undefined) updateData.isSoloed = req.body.isSoloed;
      if (req.body.instrumentType !== undefined) updateData.instrumentType = req.body.instrumentType;
      if (req.body.midiChannel !== undefined) updateData.midiChannel = req.body.midiChannel;
      if (req.body.order !== undefined) updateData.order = req.body.order;

      updateData.lastModifiedBy = req.user.id;

      const stem = await this.stemService.updateStem(stemId, updateData, req.user.id);

      res.json({
        success: true,
        data: stem,
        message: 'Stem updated successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update stem';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 400;

      res.status(statusCode).json({
        error: 'Stem update failed',
        message
      });
    }
  };

  /**
   * DELETE /api/v1/stems/:stemId
   * Delete a stem
   */
  deleteStem = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to delete stems'
        });
        return;
      }

      const { stemId } = req.params;

      if (!stemId) {
        res.status(400).json({
          error: 'Stem ID required',
          message: 'Stem ID must be provided in URL parameters'
        });
        return;
      }

      const deletedStem = await this.stemService.deleteStem(stemId, req.user.id);

      res.json({
        success: true,
        data: deletedStem,
        message: 'Stem deleted successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete stem';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 500;

      res.status(statusCode).json({
        error: 'Stem deletion failed',
        message
      });
    }
  };

  /**
   * PUT /api/v1/projects/:projectId/stems/reorder
   * Reorder stems within a project
   */
  reorderStems = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to reorder stems'
        });
        return;
      }

      const { projectId } = req.params;
      const { stemOrders } = req.body;

      if (!projectId) {
        res.status(400).json({
          error: 'Project ID required',
          message: 'Project ID must be provided in URL parameters'
        });
        return;
      }

      if (!Array.isArray(stemOrders) || stemOrders.length === 0) {
        res.status(400).json({
          error: 'Invalid stem orders',
          message: 'stemOrders must be a non-empty array of {id, order} objects'
        });
        return;
      }

      // Validate stemOrders format
      for (const stemOrder of stemOrders) {
        if (!stemOrder.id || typeof stemOrder.order !== 'number') {
          res.status(400).json({
            error: 'Invalid stem order format',
            message: 'Each stem order must have an id and a numeric order'
          });
          return;
        }
      }

      await this.stemService.reorderStems(projectId, stemOrders, req.user.id);

      res.json({
        success: true,
        message: 'Stems reordered successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reorder stems';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 400;

      res.status(statusCode).json({
        error: 'Stem reordering failed',
        message
      });
    }
  };

  /**
   * GET /api/v1/projects/:projectId/stems/permissions
   * Get user's stem permissions for a project
   */
  getStemPermissions = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to check permissions'
        });
        return;
      }

      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          error: 'Project ID required',
          message: 'Project ID must be provided in URL parameters'
        });
        return;
      }

      const permissions = await this.stemService.getStemPermissions(projectId, req.user.id);

      res.json({
        success: true,
        data: permissions,
        message: 'Stem permissions retrieved successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve stem permissions';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 500;

      res.status(statusCode).json({
        error: 'Permission check failed',
        message
      });
    }
  };

  /**
   * GET /api/v1/projects/:projectId/stems/by-instrument/:instrumentType
   * Get stems by instrument type
   */
  getStemsByInstrumentType = async (req: AuthenticatedRequest, res: TypedResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access stems'
        });
        return;
      }

      const { projectId, instrumentType } = req.params;

      if (!projectId || !instrumentType) {
        res.status(400).json({
          error: 'Parameters required',
          message: 'Project ID and instrument type must be provided'
        });
        return;
      }

      const stems = await this.stemService.getStemsByInstrumentType(projectId, instrumentType, req.user.id);

      res.json({
        success: true,
        data: stems,
        message: `Retrieved ${stems.length} ${instrumentType} stems`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve stems by instrument type';
      const statusCode = message.includes('not found') ? 404 
                      : message.includes('Access denied') ? 403 
                      : 500;

      res.status(statusCode).json({
        error: 'Stem retrieval failed',
        message
      });
    }
  };
}
