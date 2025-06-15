import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from '../services/auth';
import { UserRepository } from '../repositories/UserRepository';
import { PrismaClient } from '@prisma/client';

export class AuthController {
  private authService: AuthService;

  constructor(prisma: PrismaClient) {
    const userRepository = new UserRepository(prisma);
    this.authService = new AuthService(userRepository);
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerData: RegisterData = {
        email: req.body.email,
        displayName: req.body.displayName,
        password: req.body.password
      };

      const { user, tokens } = await this.authService.register(registerData);

      // Don't send password hash in response
      const userResponse = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        defaultTempo: user.defaultTempo,
        collaborationNotifications: user.collaborationNotifications,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        tokens
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      
      // Check for specific error types to return appropriate status codes
      if (message.includes('already exists')) {
        res.status(409).json({
          error: 'Registration failed',
          message
        });
        return;
      }

      if (message.includes('Invalid') || message.includes('must be')) {
        res.status(400).json({
          error: 'Validation failed',
          message
        });
        return;
      }

      res.status(500).json({
        error: 'Registration failed',
        message: 'An unexpected error occurred during registration'
      });
    }
  };

  /**
   * Login user
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginData = {
        email: req.body.email,
        password: req.body.password
      };

      const { user, tokens } = await this.authService.login(loginData);

      // Don't send password hash in response
      const userResponse = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        defaultTempo: user.defaultTempo,
        collaborationNotifications: user.collaborationNotifications,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        message: 'Login successful',
        user: userResponse,
        tokens
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      
      res.status(401).json({
        error: 'Login failed',
        message
      });
    }
  };

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Refresh token required',
          message: 'Refresh token must be provided'
        });
        return;
      }

      const tokens = await this.authService.refreshToken(refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        tokens
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      
      res.status(401).json({
        error: 'Token refresh failed',
        message
      });
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access profile'
        });
        return;
      }

      // req.user is set by auth middleware and only contains safe fields
      res.json({
        message: 'Profile retrieved successfully',
        user: req.user
      });
    } catch {
      res.status(500).json({
        error: 'Profile retrieval failed',
        message: 'An unexpected error occurred'
      });
    }
  };

  /**
   * Logout user (client-side token invalidation)
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // Since we're using stateless JWT tokens, logout is primarily handled client-side
      // The client should remove the tokens from storage
      // In a more sophisticated implementation, we could maintain a token blacklist in Redis
      
      res.json({
        message: 'Logout successful'
      });
    } catch {
      res.status(500).json({
        error: 'Logout failed',
        message: 'An unexpected error occurred'
      });
    }
  };

  /**
   * Validate token endpoint (for client-side token verification)
   * POST /api/auth/validate
   */
  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          error: 'Token required',
          message: 'Token must be provided for validation'
        });
        return;
      }

      const user = await this.authService.getUserFromToken(token);

      const userResponse = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
      };

      res.json({
        message: 'Token is valid',
        valid: true,
        user: userResponse
      });
    } catch {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
        valid: false
      });
    }
  };
}
