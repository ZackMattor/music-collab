import { testDatabase } from '../config/test-database';
import { DatabaseSeeder } from './database-seeder';

/**
 * Test setup utilities for integration tests
 */
export class TestSetup {
  static async beforeAll() {
    // Connect to test database
    await testDatabase.connect();
  }

  static async afterAll() {
    // Disconnect from test database
    await testDatabase.disconnect();
  }

  static async beforeEach() {
    // Clean database before each test
    await testDatabase.cleanup();
  }

  static async afterEach() {
    // Additional cleanup if needed
    // The beforeEach cleanup should be sufficient for most cases
  }

  static getSeeder() {
    return new DatabaseSeeder(testDatabase.prisma);
  }

  static getPrisma() {
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
export function extractToken(response: any): string {
  return response.body.tokens?.accessToken || response.body.token;
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
) {
  const user = await seeder.createUser(userCredentials);
  return {
    user,
    credentials: userCredentials,
  };
}
