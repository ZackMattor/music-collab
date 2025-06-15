/**
 * Jest setup file for integration tests
 * This file runs before each test suite
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
// eslint-disable-next-line no-undef
jest.setTimeout(30000);

// Global test configuration
// eslint-disable-next-line no-undef
beforeAll(async () => {
  // Any global setup needed
});

// eslint-disable-next-line no-undef
afterAll(async () => {
  // Any global cleanup needed
});
