import { AuthService, RegisterData, LoginData } from './auth';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../repositories/UserRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockedUserRepository = jest.mocked(UserRepository);
const mockedBcrypt = jest.mocked(bcrypt);
const mockedJwt = jest.mocked(jwt);

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    avatar: null,
    passwordHash: 'hashed-password',
    defaultTempo: 120,
    collaborationNotifications: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock repository instance
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findWithProjects: jest.fn(),
      findCollaboratingUsers: jest.fn(),
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Mock the constructor to return our mock instance
    mockedUserRepository.mockImplementation(() => mockUserRepository as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    authService = new AuthService(mockUserRepository);

    // Setup default environment variables
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRY = '15m';
    process.env.JWT_REFRESH_EXPIRY = '7d';
  });

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      const password = 'testpassword123';
      const hashedPassword = 'hashed-password';

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await authService.hashPassword(password);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should compare password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = 'hashed-password';

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await authService.comparePassword(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockedJwt.sign
        .mockReturnValueOnce(accessToken as never)
        .mockReturnValueOnce(refreshToken as never);

      const result = authService.generateTokens(mockUser);

      expect(mockedJwt.sign).toHaveBeenCalledTimes(2);
      expect(mockedJwt.sign).toHaveBeenNthCalledWith(
        1,
        {
          userId: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          type: 'access'
        },
        'test-access-secret',
        { expiresIn: '15m' }
      );
      expect(mockedJwt.sign).toHaveBeenNthCalledWith(
        2,
        {
          userId: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          type: 'refresh'
        },
        'test-refresh-secret',
        { expiresIn: '7d' }
      );
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });

  describe('verifyToken', () => {
    it('should verify access token', () => {
      const token = 'valid-token';
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        type: 'access' as const
      };

      mockedJwt.verify.mockReturnValue(payload as never);

      const result = authService.verifyToken(token, 'access');

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test-access-secret');
      expect(result).toEqual(payload);
    });

    it('should verify refresh token', () => {
      const token = 'valid-refresh-token';
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        type: 'refresh' as const
      };

      mockedJwt.verify.mockReturnValue(payload as never);

      const result = authService.verifyToken(token, 'refresh');

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test-refresh-secret');
      expect(result).toEqual(payload);
    });
  });

  describe('register', () => {
    const registerData: RegisterData = {
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      password: 'testpassword123'
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      mockedJwt.sign
        .mockReturnValueOnce('access-token' as never)
        .mockReturnValueOnce('refresh-token' as never);

      const result = await authService.register(registerData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(registerData.username);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerData.password, 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerData.email,
        username: registerData.username,
        displayName: registerData.displayName,
        passwordHash: 'hashed-password'
      });
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw error if username already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow(
        'User with this username already exists'
      );
    });

    it('should throw error for invalid email', async () => {
      const invalidData = { ...registerData, email: 'invalid-email' };

      await expect(authService.register(invalidData)).rejects.toThrow(
        'Invalid email address'
      );
    });

    it('should throw error for short password', async () => {
      const invalidData = { ...registerData, password: '123' };

      await expect(authService.register(invalidData)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should throw error for invalid username', async () => {
      const invalidData = { ...registerData, username: 'test user!' };

      await expect(authService.register(invalidData)).rejects.toThrow(
        'Username can only contain letters, numbers, underscores, and hyphens'
      );
    });
  });

  describe('login', () => {
    const loginData: LoginData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };

    it('should login user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign
        .mockReturnValueOnce('access-token' as never)
        .mockReturnValueOnce('refresh-token' as never);

      const result = await authService.login(loginData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw error if password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        type: 'refresh' as const
      };

      mockedJwt.verify.mockReturnValue(payload as never);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockedJwt.sign
        .mockReturnValueOnce('new-access-token' as never)
        .mockReturnValueOnce('new-refresh-token' as never);

      const result = await authService.refreshToken(refreshToken);

      expect(mockedJwt.verify).toHaveBeenCalledWith(refreshToken, 'test-refresh-secret');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.userId);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });
    });

    it('should throw error if token is invalid', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error if user not found', async () => {
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        type: 'refresh' as const
      };

      mockedJwt.verify.mockReturnValue(payload as never);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.refreshToken('valid-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('getUserFromToken', () => {
    it('should get user from valid token', async () => {
      const token = 'valid-access-token';
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        type: 'access' as const
      };

      mockedJwt.verify.mockReturnValue(payload as never);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.getUserFromToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(token, 'test-access-secret');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if token is invalid', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.getUserFromToken('invalid-token')).rejects.toThrow(
        'Invalid access token'
      );
    });

    it('should throw error if user not found', async () => {
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        type: 'access' as const
      };

      mockedJwt.verify.mockReturnValue(payload as never);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.getUserFromToken('valid-token')).rejects.toThrow(
        'Invalid access token'
      );
    });
  });
});
