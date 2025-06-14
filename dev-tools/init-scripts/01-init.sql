-- Initialize development database with some basic setup
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions that we might need
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a test database for running tests
CREATE DATABASE music_collab_test OWNER dev_user;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE music_collab_dev TO dev_user;
GRANT ALL PRIVILEGES ON DATABASE music_collab_test TO dev_user;
