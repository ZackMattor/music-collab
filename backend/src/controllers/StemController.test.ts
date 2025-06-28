import { StemController } from './StemController';
import { StemService } from '../services/StemService';
import { AuthenticatedRequest, TypedResponse } from '../types/express';
import { Stem } from '@prisma/client';

// Mock StemService
const mockStemService = {
  getProjectStems: jest.fn(),
  getStemById: jest.fn(),
  getStemWithSegments: jest.fn(),
  createStem: jest.fn(),
  updateStem: jest.fn(),
  deleteStem: jest.fn(),
  reorderStems: jest.fn(),
  getStemsByInstrumentType: jest.fn(),
  getStemPermissions: jest.fn(),
} as unknown as StemService;

describe('StemController', () => {
  let stemController: StemController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<TypedResponse>;
  let mockStem: Stem;

  beforeEach(() => {
    jest.clearAllMocks();
    
    stemController = new StemController(mockStemService);
    
    mockRequest = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      params: {},
      body: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockStem = {
      id: 'stem-1',
      projectId: 'project-1',
      name: 'Test Stem',
      color: '#3B82F6',
      volume: 1.0,
      pan: 0.0,
      isMuted: false,
      isSoloed: false,
      instrumentType: 'piano',
      midiChannel: 1,
      order: 0,
      version: 1,
      lastModifiedBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('getProjectStems', () => {
    it('should return project stems successfully', async () => {
      const stems = [mockStem];
      mockRequest.params = { projectId: 'project-1' };
      (mockStemService.getProjectStems as jest.Mock).mockResolvedValue(stems);

      await stemController.getProjectStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.getProjectStems).toHaveBeenCalledWith('project-1', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: stems,
        message: 'Retrieved 1 stems for project'
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      delete mockRequest.user;

      await stemController.getProjectStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access stems'
      });
    });

    it('should return 400 when projectId is missing', async () => {
      mockRequest.params = {};

      await stemController.getProjectStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Project ID required',
        message: 'Project ID must be provided in URL parameters'
      });
    });

    it('should return 404 when project is not found', async () => {
      mockRequest.params = { projectId: 'project-1' };
      (mockStemService.getProjectStems as jest.Mock).mockRejectedValue(new Error('Project not found'));

      await stemController.getProjectStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Stem retrieval failed',
        message: 'Project not found'
      });
    });

    it('should return 403 when access is denied', async () => {
      mockRequest.params = { projectId: 'project-1' };
      (mockStemService.getProjectStems as jest.Mock).mockRejectedValue(new Error('Access denied'));

      await stemController.getProjectStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Stem retrieval failed',
        message: 'Access denied'
      });
    });
  });

  describe('getStemById', () => {
    it('should return stem successfully', async () => {
      mockRequest.params = { stemId: 'stem-1' };
      (mockStemService.getStemById as jest.Mock).mockResolvedValue(mockStem);

      await stemController.getStemById(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.getStemById).toHaveBeenCalledWith('stem-1', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStem,
        message: 'Stem retrieved successfully'
      });
    });

    it('should return stem with segments when requested', async () => {
      const stemWithSegments = { ...mockStem, segments: [] };
      mockRequest.params = { stemId: 'stem-1' };
      mockRequest.query = { withSegments: 'true' };
      (mockStemService.getStemWithSegments as jest.Mock).mockResolvedValue(stemWithSegments);

      await stemController.getStemById(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.getStemWithSegments).toHaveBeenCalledWith('stem-1', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: stemWithSegments,
        message: 'Stem retrieved successfully'
      });
    });

    it('should return 404 when stem is not found', async () => {
      mockRequest.params = { stemId: 'stem-1' };
      (mockStemService.getStemById as jest.Mock).mockResolvedValue(null);

      await stemController.getStemById(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Stem not found',
        message: 'The specified stem does not exist or you do not have access to it'
      });
    });
  });

  describe('createStem', () => {
    it('should create stem successfully', async () => {
      mockRequest.params = { projectId: 'project-1' };
      mockRequest.body = {
        name: 'New Stem',
        color: '#FF0000',
        instrumentType: 'guitar'
      };
      (mockStemService.createStem as jest.Mock).mockResolvedValue(mockStem);

      await stemController.createStem(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.createStem).toHaveBeenCalledWith({
        projectId: 'project-1',
        name: 'New Stem',
        color: '#FF0000',
        volume: undefined,
        pan: undefined,
        instrumentType: 'guitar',
        midiChannel: undefined,
        order: undefined,
        lastModifiedBy: 'user-1'
      }, 'user-1');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStem,
        message: 'Stem created successfully'
      });
    });

    it('should return 400 when name is missing', async () => {
      mockRequest.params = { projectId: 'project-1' };
      mockRequest.body = {};

      await stemController.createStem(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Stem name is required'
      });
    });

    it('should return 403 when user lacks permission', async () => {
      mockRequest.params = { projectId: 'project-1' };
      mockRequest.body = { name: 'New Stem' };
      (mockStemService.createStem as jest.Mock).mockRejectedValue(new Error('Access denied'));

      await stemController.createStem(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Stem creation failed',
        message: 'Access denied'
      });
    });
  });

  describe('updateStem', () => {
    it('should update stem successfully', async () => {
      const updatedStem = { ...mockStem, name: 'Updated Stem' };
      mockRequest.params = { stemId: 'stem-1' };
      mockRequest.body = {
        name: 'Updated Stem',
        volume: 0.8
      };
      (mockStemService.updateStem as jest.Mock).mockResolvedValue(updatedStem);

      await stemController.updateStem(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.updateStem).toHaveBeenCalledWith('stem-1', {
        name: 'Updated Stem',
        volume: 0.8,
        lastModifiedBy: 'user-1'
      }, 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedStem,
        message: 'Stem updated successfully'
      });
    });

    it('should return 400 when stemId is missing', async () => {
      mockRequest.params = {};

      await stemController.updateStem(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Stem ID required',
        message: 'Stem ID must be provided in URL parameters'
      });
    });
  });

  describe('deleteStem', () => {
    it('should delete stem successfully', async () => {
      mockRequest.params = { stemId: 'stem-1' };
      (mockStemService.deleteStem as jest.Mock).mockResolvedValue(mockStem);

      await stemController.deleteStem(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.deleteStem).toHaveBeenCalledWith('stem-1', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStem,
        message: 'Stem deleted successfully'
      });
    });

    it('should return 404 when stem is not found', async () => {
      mockRequest.params = { stemId: 'stem-1' };
      (mockStemService.deleteStem as jest.Mock).mockRejectedValue(new Error('Stem not found'));

      await stemController.deleteStem(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Stem deletion failed',
        message: 'Stem not found'
      });
    });
  });

  describe('reorderStems', () => {
    it('should reorder stems successfully', async () => {
      mockRequest.params = { projectId: 'project-1' };
      mockRequest.body = {
        stemOrders: [
          { id: 'stem-1', order: 1 },
          { id: 'stem-2', order: 0 }
        ]
      };
      (mockStemService.reorderStems as jest.Mock).mockResolvedValue(undefined);

      await stemController.reorderStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.reorderStems).toHaveBeenCalledWith(
        'project-1', 
        mockRequest.body.stemOrders, 
        'user-1'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Stems reordered successfully'
      });
    });

    it('should return 400 when stemOrders is invalid', async () => {
      mockRequest.params = { projectId: 'project-1' };
      mockRequest.body = { stemOrders: [] };

      await stemController.reorderStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid stem orders',
        message: 'stemOrders must be a non-empty array of {id, order} objects'
      });
    });

    it('should return 400 when stemOrder format is invalid', async () => {
      mockRequest.params = { projectId: 'project-1' };
      mockRequest.body = {
        stemOrders: [
          { id: 'stem-1' } // missing order
        ]
      };

      await stemController.reorderStems(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid stem order format',
        message: 'Each stem order must have an id and a numeric order'
      });
    });
  });

  describe('getStemPermissions', () => {
    it('should return stem permissions successfully', async () => {
      const permissions = {
        canAddStems: true,
        canDeleteStems: false,
        canEdit: true
      };
      mockRequest.params = { projectId: 'project-1' };
      (mockStemService.getStemPermissions as jest.Mock).mockResolvedValue(permissions);

      await stemController.getStemPermissions(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.getStemPermissions).toHaveBeenCalledWith('project-1', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: permissions,
        message: 'Stem permissions retrieved successfully'
      });
    });
  });

  describe('getStemsByInstrumentType', () => {
    it('should return stems by instrument type successfully', async () => {
      const stems = [mockStem];
      mockRequest.params = { projectId: 'project-1', instrumentType: 'piano' };
      (mockStemService.getStemsByInstrumentType as jest.Mock).mockResolvedValue(stems);

      await stemController.getStemsByInstrumentType(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockStemService.getStemsByInstrumentType).toHaveBeenCalledWith('project-1', 'piano', 'user-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: stems,
        message: 'Retrieved 1 piano stems'
      });
    });

    it('should return 400 when parameters are missing', async () => {
      mockRequest.params = { projectId: 'project-1' }; // missing instrumentType

      await stemController.getStemsByInstrumentType(mockRequest as AuthenticatedRequest, mockResponse as TypedResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Parameters required',
        message: 'Project ID and instrument type must be provided'
      });
    });
  });
});
