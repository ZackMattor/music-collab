import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  env: string;
  port: number;
  cors: {
    origin: string | string[];
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'music_collab_dev',
    username: process.env.DB_USERNAME || 'dev_user',
    password: process.env.DB_PASSWORD || 'dev_password',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || 'dev_redis_password',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  fileUpload: {
    maxSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '52428800', 10), // 50MB
    allowedTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/aac',
      'application/octet-stream', // For MIDI files
    ],
  },
};
