import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  createProjectAccessMiddleware,
  validateAuthRequest
} from './auth';
import { AuthService } from '../services/auth';

// Mock dependencies
jest.mock('../services/auth');

// Mock Prisma Client
const mockPrisma = {
  project: {
    findUnique: jest.fn(),
  },
  projectCollaborator: {
    findUnique: jest.fn(),
  }
} as unknown as PrismaClient;

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Setup mocks
    mockReq = {
      headers: {},
      params: {},
      body: {},
      ip: '127.0.0.1'
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    mockAuthService = {
      getUserFromToken: jest.fn()
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Mock AuthService constructor to return our mock
    (AuthService as jest.MockedClass<typeof AuthService>).mockImplementation(() => mockAuthService);

    jest.clearAllMocks();
  });

  describe('createProjectAccessMiddleware', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 'user1',
        email: 'test@example.com',
        displayName: 'Test User'
      };
    });

    it('should allow project owner full access', async () => {
      // Arrange
      const mockProject = {
        id: 'project1',
        ownerId: 'user1',
        name: 'Test Project'
      };

      mockReq.params = { projectId: 'project1' };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const projectAccessMiddleware = createProjectAccessMiddleware(mockPrisma);

      // Act
      await projectAccessMiddleware('admin')(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'project1' }
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow collaborator with sufficient permissions', async () => {
      // Arrange
      const mockProject = {
        id: 'project1',
        ownerId: 'owner1',
        name: 'Test Project'
      };

      const mockCollaborator = {
        projectId: 'project1',  
        userId: 'user1',
        role: 'COLLABORATOR'
      };

      mockReq.params = { projectId: 'project1' };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.projectCollaborator.findUnique as jest.Mock).mockResolvedValue(mockCollaborator);

      const projectAccessMiddleware = createProjectAccessMiddleware(mockPrisma);

      // Act
      await projectAccessMiddleware('write')(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockPrisma.projectCollaborator.findUnique).toHaveBeenCalledWith({
        where: {
          projectId_userId: {
            projectId: 'project1',
            userId: 'user1'
          }
        }
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access to collaborator with insufficient permissions', async () => {
      // Arrange
      const mockProject = {
        id: 'project1',
        ownerId: 'owner1',
        name: 'Test Project'
      };

      const mockCollaborator = {
        projectId: 'project1',
        userId: 'user1',
        role: 'VIEWER'
      };

      mockReq.params = { projectId: 'project1' };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.projectCollaborator.findUnique as jest.Mock).mockResolvedValue(mockCollaborator);

      const projectAccessMiddleware = createProjectAccessMiddleware(mockPrisma);

      // Act
      await projectAccessMiddleware('write')(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        message: 'You need write permission to perform this action'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access to non-collaborator', async () => {
      // Arrange
      const mockProject = {
        id: 'project1',
        ownerId: 'owner1',
        name: 'Test Project'
      };

      mockReq.params = { projectId: 'project1' };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.projectCollaborator.findUnique as jest.Mock).mockResolvedValue(null);

      const projectAccessMiddleware = createProjectAccessMiddleware(mockPrisma);

      // Act
      await projectAccessMiddleware('read')(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'You do not have access to this project'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent project', async () => {
      // Arrange
      mockReq.params = { projectId: 'nonexistent' };
      (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      const projectAccessMiddleware = createProjectAccessMiddleware(mockPrisma);

      // Act
      await projectAccessMiddleware('read')(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Project not found',
        message: 'The specified project does not exist'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      // Arrange
      delete mockReq.user; // Remove user property
      const projectAccessMiddleware = createProjectAccessMiddleware(mockPrisma);

      // Act
      await projectAccessMiddleware('read')(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should require project ID', async () => {
      // Arrange
      const projectAccessMiddleware = createProjectAccessMiddleware(mockPrisma);

      // Act
      await projectAccessMiddleware('read')(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Project ID required',
        message: 'Project ID must be provided in URL parameters or request body'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateAuthRequest', () => {
    it('should validate required fields successfully', () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const validator = validateAuthRequest(['email', 'password']);

      // Act
      validator(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject request with missing fields', () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com'
        // password missing
      };

      const validator = validateAuthRequest(['email', 'password']);

      // Act
      validator(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        message: 'The following fields are required: password',
        missingFields: ['password']
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should trim string fields', () => {
      // Arrange
      mockReq.body = {
        email: '  test@example.com  ',
        password: '  password123  '
      };

      const validator = validateAuthRequest(['email', 'password']);

      // Act
      validator(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.body.email).toBe('test@example.com');
      expect(mockReq.body.password).toBe('password123');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
