/**
 * Test environment configuration
 * Sets up environment variables for testing
 */

// Test database configuration - use a separate test database
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://dev_user:dev_password@localhost:5432/music_collab_test?schema=public';

// JWT secrets for testing
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-integration-tests';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-integration-tests';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

// Disable logging in tests
process.env.LOG_LEVEL = 'error';
