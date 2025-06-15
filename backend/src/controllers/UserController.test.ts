import { Request, Response } from 'express';
import { UserController } from './UserController';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '@prisma/client';

// Mock the UserRepository
jest.mock('../repositories/UserRepository');

describe('UserController', () => {
  let userController: UserController;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    passwordHash: 'hashed-password',
    defaultTempo: 120,
    collaborationNotifications: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    mockUserRepository = new UserRepository({} as any) as jest.Mocked<UserRepository>; // eslint-disable-line @typescript-eslint/no-explicit-any
    userController = new UserController(mockUserRepository);

    mockReq = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User'
      },
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      await userController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile retrieved successfully',
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
        }
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      delete mockReq.user;

      // Act
      await userController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access profile'
      });
    });

    it('should return 404 when user is not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      await userController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User not found',
        message: 'User profile not found'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await userController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Profile retrieval failed',
        message: 'Database error'
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, displayName: 'Updated Name' };
      mockReq.body = { displayName: 'Updated Name' };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        displayName: 'Updated Name'
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: expect.objectContaining({
          displayName: 'Updated Name'
        })
      });
    });

    it('should validate display name length', async () => {
      // Arrange
      mockReq.body = { displayName: 'a'.repeat(51) };

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Display name must be 50 characters or less'
      });
    });

    it('should validate empty display name', async () => {
      // Arrange
      mockReq.body = { displayName: '' };

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Display name must be a non-empty string'
      });
    });

    it('should handle avatar updates', async () => {
      // Arrange
      const updatedUser = { ...mockUser, avatar: 'https://newavatar.com/image.jpg' };
      mockReq.body = { avatar: 'https://newavatar.com/image.jpg' };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        avatar: 'https://newavatar.com/image.jpg'
      });
    });

    it('should return 400 when no valid fields provided', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'No valid fields provided for update'
      });
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      await userController.getPreferences(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Preferences retrieved successfully',
        preferences: {
          defaultTempo: 120,
          collaborationNotifications: true
        }
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      delete mockReq.user;

      // Act
      await userController.getPreferences(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access preferences'
      });
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, defaultTempo: 140, collaborationNotifications: false };
      mockReq.body = { defaultTempo: 140, collaborationNotifications: false };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await userController.updatePreferences(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        defaultTempo: 140,
        collaborationNotifications: false
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Preferences updated successfully',
        preferences: {
          defaultTempo: 140,
          collaborationNotifications: false
        }
      });
    });

    it('should validate tempo range', async () => {
      // Arrange
      mockReq.body = { defaultTempo: 300 };

      // Act
      await userController.updatePreferences(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Default tempo must be an integer between 60 and 200 BPM'
      });
    });

    it('should validate tempo minimum', async () => {
      // Arrange
      mockReq.body = { defaultTempo: 30 };

      // Act
      await userController.updatePreferences(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Default tempo must be an integer between 60 and 200 BPM'
      });
    });

    it('should validate notification setting type', async () => {
      // Arrange
      mockReq.body = { collaborationNotifications: 'invalid' };

      // Act
      await userController.updatePreferences(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Collaboration notifications must be a boolean value'
      });
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, avatar: 'https://newavatar.com/image.jpg' };
      mockReq.body = { avatarUrl: 'https://newavatar.com/image.jpg' };
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await userController.updateAvatar(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        avatar: 'https://newavatar.com/image.jpg'
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Avatar updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          displayName: updatedUser.displayName,
          avatar: updatedUser.avatar
        }
      });
    });

    it('should validate avatar URL is provided', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await userController.updateAvatar(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Avatar URL is required'
      });
    });

    it('should validate avatar URL is string', async () => {
      // Arrange
      mockReq.body = { avatarUrl: 123 };

      // Act
      await userController.updateAvatar(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Avatar URL must be a string'
      });
    });

    it('should validate avatar URL format', async () => {
      // Arrange
      mockReq.body = { avatarUrl: 'not-a-valid-url' };

      // Act
      await userController.updateAvatar(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Avatar URL must be a valid URL'
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      // Arrange
      mockReq.body = { confirmPassword: 'password123' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(mockUser);

      // Act
      await userController.deleteAccount(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account deleted successfully'
      });
    });

    it('should require password confirmation', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await userController.deleteAccount(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Password confirmation is required for account deletion'
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      delete mockReq.user;

      // Act
      await userController.deleteAccount(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to delete account'
      });
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      mockReq.body = { confirmPassword: 'password123' };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      await userController.deleteAccount(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User not found',
        message: 'User account not found'
      });
    });
  });
});
