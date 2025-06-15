import { Request, Response } from 'express';
import { AuthController } from './AuthController';

// Mock the AuthService module
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  getUserFromToken: jest.fn(),
};

jest.mock('../services/auth', () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService)
}));

jest.mock('../repositories/UserRepository');

describe('AuthController', () => {
  let authController: AuthController;
  let mockReq: any;
  let mockRes: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    avatar: null,
    passwordHash: 'hashed-password',
    defaultTempo: 120,
    collaborationNotifications: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockPrisma = {} as any;
    authController = new AuthController(mockPrisma);

    mockReq = {
      body: {},
      user: undefined
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'securepassword123'
      };

      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens
      });

      // Act
      await authController.register(mockReq, mockRes);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'securepassword123'
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          displayName: mockUser.displayName,
          avatar: mockUser.avatar,
          defaultTempo: mockUser.defaultTempo,
          collaborationNotifications: mockUser.collaborationNotifications,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt
        },
        tokens: mockTokens
      });
    });

    it('should return 409 when user already exists', async () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'securepassword123'
      };

      mockAuthService.register.mockRejectedValue(
        new Error('User with this email already exists')
      );

      // Act
      await authController.register(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Registration failed',
        message: 'User with this email already exists'
      });
    });

    it('should return 400 for validation errors', async () => {
      // Arrange
      mockReq.body = {
        email: 'invalid-email',
        username: 'testuser',
        displayName: 'Test User',
        password: 'weak'
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Invalid email address')
      );

      // Act
      await authController.register(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Invalid email address'
      });
    });

    it('should return 500 for unexpected errors', async () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'securepassword123'
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      await authController.register(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Registration failed',
        message: 'An unexpected error occurred during registration'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        password: 'securepassword123'
      };

      mockAuthService.login = jest.fn().mockResolvedValue({
        user: mockUser,
        tokens: mockTokens
      });

      // Act
      await authController.login(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'securepassword123'
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          displayName: mockUser.displayName,
          avatar: mockUser.avatar,
          defaultTempo: mockUser.defaultTempo,
          collaborationNotifications: mockUser.collaborationNotifications,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt
        },
        tokens: mockTokens
      });
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockAuthService.login = jest.fn().mockRejectedValue(
        new Error('Invalid email or password')
      );

      // Act
      await authController.login(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Login failed',
        message: 'Invalid email or password'
      });
    });

    it('should handle non-Error objects', async () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        password: 'securepassword123'
      };

      mockAuthService.login = jest.fn().mockRejectedValue('String error');

      // Act
      await authController.login(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Login failed',
        message: 'Login failed'
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      mockReq.body = {
        refreshToken: 'valid-refresh-token'
      };

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      mockAuthService.refreshToken = jest.fn().mockResolvedValue(newTokens);

      // Act
      await authController.refreshToken(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token refreshed successfully',
        tokens: newTokens
      });
    });

    it('should return 400 when refresh token is missing', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await authController.refreshToken(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Refresh token required',
        message: 'Refresh token must be provided'
      });
      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid refresh token', async () => {
      // Arrange
      mockReq.body = {
        refreshToken: 'invalid-refresh-token'
      };

      mockAuthService.refreshToken = jest.fn().mockRejectedValue(
        new Error('Invalid refresh token')
      );

      // Act
      await authController.refreshToken(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token refresh failed',
        message: 'Invalid refresh token'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      // Arrange
      mockReq.user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User'
      };

      // Act
      await authController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile retrieved successfully',
        user: mockReq.user
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockReq.user = undefined;

      // Act
      await authController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access profile'
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      mockReq.user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User'
      };

      // Mock res.json to throw an error on first call, but work on second call
      let callCount = 0;
      mockRes.json = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Response error');
        }
        return mockRes;
      });

      // Act
      await authController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Profile retrieval failed',
        message: 'An unexpected error occurred'
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Act
      await authController.logout(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Logout successful'
      });
    });

    it('should handle unexpected errors during logout', async () => {
      // Mock res.json to throw an error on first call, but work on second call
      let callCount = 0;
      mockRes.json = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Response error');
        }
        return mockRes;
      });

      // Act
      await authController.logout(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Logout failed',
        message: 'An unexpected error occurred'
      });
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      // Arrange
      mockReq.body = {
        token: 'valid-access-token'
      };

      mockAuthService.getUserFromToken = jest.fn().mockResolvedValue(mockUser);

      // Act
      await authController.validateToken(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAuthService.getUserFromToken).toHaveBeenCalledWith('valid-access-token');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token is valid',
        valid: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          displayName: mockUser.displayName,
          avatar: mockUser.avatar
        }
      });
    });

    it('should return 400 when token is missing', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await authController.validateToken(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token required',
        message: 'Token must be provided for validation'
      });
      expect(mockAuthService.getUserFromToken).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      // Arrange
      mockReq.body = {
        token: 'invalid-token'
      };

      mockAuthService.getUserFromToken = jest.fn().mockRejectedValue(
        new Error('Invalid access token')
      );

      // Act
      await authController.validateToken(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
        valid: false
      });
    });

    it('should handle non-Error objects in token validation', async () => {
      // Arrange
      mockReq.body = {
        token: 'invalid-token'
      };

      mockAuthService.getUserFromToken = jest.fn().mockRejectedValue('String error');

      // Act
      await authController.validateToken(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
        valid: false
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should not expose password hash in any response', async () => {
      // Test registration
      mockReq.body = {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'securepassword123'
      };

      mockAuthService.register = jest.fn().mockResolvedValue({
        user: mockUser,
        tokens: mockTokens
      });

      await authController.register(mockReq as Request, mockRes as Response);

      // Assert password hash is not in response
      const registerCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(registerCall.user).not.toHaveProperty('passwordHash');

      // Reset mocks for login test
      jest.clearAllMocks();
      mockRes.json = jest.fn().mockReturnThis();

      // Test login
      mockReq.body = {
        email: 'test@example.com',
        password: 'securepassword123'
      };

      mockAuthService.login = jest.fn().mockResolvedValue({
        user: mockUser,
        tokens: mockTokens
      });

      await authController.login(mockReq as Request, mockRes as Response);

      // Assert password hash is not in response
      const loginCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(loginCall.user).not.toHaveProperty('passwordHash');
    });

    it('should handle edge case with empty request body', async () => {
      // Arrange
      mockReq.body = {};

      mockAuthService.register = jest.fn().mockRejectedValue(
        new Error('Email is required')
      );

      // Act
      await authController.register(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: undefined,
        username: undefined,
        displayName: undefined,
        password: undefined
      });
    });
  });
});
