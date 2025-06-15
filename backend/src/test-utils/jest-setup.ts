/**
 * Jest setup file for integration tests
 * This file runs before each test suite
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test configuration
beforeAll(async () => {
  // Any global setup needed
});

afterAll(async () => {
  // Any global cleanup needed
});
