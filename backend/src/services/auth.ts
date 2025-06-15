import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  type: 'access' | 'refresh';
}

export interface RegisterData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor(private userRepository: UserRepository) {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain password with a hashed password
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT access and refresh tokens
   */
  generateTokens(user: User): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      this.accessTokenSecret as string,
      { expiresIn: this.accessTokenExpiry } as SignOptions
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.refreshTokenSecret as string,
      { expiresIn: this.refreshTokenExpiry } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string, type: 'access' | 'refresh'): TokenPayload {
    const secret = type === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;
    return jwt.verify(token, secret) as TokenPayload;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUserByEmail = await this.userRepository.findByEmail(data.email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await this.userRepository.findByUsername(data.username);
    if (existingUserByUsername) {
      throw new Error('User with this username already exists');
    }

    // Validate input
    this.validateRegistrationData(data);

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      passwordHash
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.verifyToken(refreshToken, 'refresh');

      // Get user to ensure they still exist
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user from access token
   */
  async getUserFromToken(accessToken: string): Promise<User> {
    try {
      const payload = this.verifyToken(accessToken, 'access');
      const user = await this.userRepository.findById(payload.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Validate registration data
   */
  private validateRegistrationData(data: RegisterData): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Invalid email address');
    }

    if (!data.username || data.username.length < 3 || data.username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }

    if (!data.displayName || data.displayName.length < 1 || data.displayName.length > 50) {
      throw new Error('Display name must be between 1 and 50 characters');
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Username can only contain alphanumeric characters, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
