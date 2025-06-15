import { PrismaClient } from '@prisma/client';
import { testDatabase } from '../config/test-database';
import { DatabaseSeeder, TestUser } from './database-seeder';

/**
 * Integration test setup utilities for database-driven tests
 */
export class TestIntegrationSetup {
  static async beforeAll(): Promise<void> {
    // Connect to test database
    await testDatabase.connect();
  }

  static async afterAll(): Promise<void> {
    // Disconnect from test database
    await testDatabase.disconnect();
  }

  static async beforeEach(): Promise<void> {
    // Clean database before each test
    await testDatabase.cleanup();
  }

  static async afterEach(): Promise<void> {
    // Additional cleanup if needed
    // The beforeEach cleanup should be sufficient for most cases
  }

  static getSeeder(): DatabaseSeeder {
    return new DatabaseSeeder(testDatabase.prisma);
  }

  static getPrisma(): PrismaClient {
    return testDatabase.prisma;
  }
}

/**
 * Helper function to create authentication headers
 */
export function createAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Helper function to extract JWT token from response
 */
export function extractToken(response: { body: { tokens?: { accessToken?: string }; token?: string } }): string {
  return response.body.tokens?.accessToken || response.body.token || '';
}

/**
 * Helper function to create test user and return auth token
 */
export async function createAuthenticatedUser(
  userCredentials: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  },
  seeder: DatabaseSeeder
): Promise<{
  user: TestUser;
  credentials: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  };
}> {
  const user = await seeder.createUser(userCredentials);
  return {
    user,
    credentials: userCredentials,
  };
}
