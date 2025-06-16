import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserData } from '../repositories/interfaces';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface RegisterData {
  email: string;
  displayName?: string;
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
      email: user.email
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

    // Validate input
    this.validateRegistrationData(data);

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user - treat empty displayName as undefined
    const displayName = data.displayName?.trim() || undefined;
    const createData: CreateUserData = {
      email: data.email,
      passwordHash,
      ...(displayName && { displayName })
    };

    const user = await this.userRepository.create(createData);

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
    } catch {
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
    } catch {
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

    // Display name is optional - only validate if provided and not empty
    if (data.displayName !== undefined && data.displayName.trim() !== '' && data.displayName.length > 50) {
      throw new Error('Display name must be 50 characters or less');
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
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
