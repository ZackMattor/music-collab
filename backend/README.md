# Music Collaboration Platform - Backend

The backend API for the Music Collaboration Platform, built with Node.js, TypeScript, and Express.js.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Backend runs on http://localhost:3000
```

## 🏗️ Architecture

The backend follows a layered architecture pattern:

```
src/
├── app.ts                  # Express application setup
├── index.ts                # Application entry point
├── config/                 # Configuration management
│   └── index.ts           # Environment variables and config
├── controllers/            # Request handlers (HTTP layer)
├── middleware/             # Express middleware
│   ├── errorHandler.ts    # Global error handling
│   └── notFoundHandler.ts # 404 handler
├── models/                 # Data models and entities
├── routes/                 # API route definitions
│   └── index.ts           # Route registration
├── services/               # Business logic layer
├── types/                  # TypeScript type definitions
│   └── index.ts           # Shared types
└── utils/                  # Utility functions
    └── index.ts           # Helper functions
```

## 📡 API Endpoints

### Health & Info
- `GET /health` - Health check endpoint
- `GET /api` - API information and available endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### User Management (Coming Soon)
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/preferences` - Get user preferences
- `PUT /api/v1/users/preferences` - Update preferences

### Project Management (Coming Soon)
- `GET /api/v1/projects` - List user's projects
- `POST /api/v1/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Track Management (Coming Soon)
- `GET /api/projects/:id/tracks` - Get project tracks
- `POST /api/projects/:id/tracks` - Create new track
- `PUT /api/tracks/:id` - Update track
- `DELETE /api/tracks/:id` - Delete track

### Collaboration (Coming Soon)
- `POST /api/projects/:id/collaborators` - Invite collaborator
- `GET /api/projects/:id/collaborators` - List collaborators
- `PUT /api/projects/:id/collaborators/:userId` - Update permissions
- `DELETE /api/projects/:id/collaborators/:userId` - Remove collaborator

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Development server (auto-reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Test coverage
npm run test:coverage

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Code formatting
npm run format

# Type checking
npm run typecheck

# Clean build directory
npm run clean
```

## 🧪 Testing

The backend uses Jest for testing with a co-located test structure:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
- Tests are placed next to the source files they test
- File naming: `example.ts` → `example.test.ts`
- Test categories: Unit tests, Integration tests, API tests

### Example Test
```typescript
// src/utils/index.test.ts
import { formatResponse } from './index'

describe('Utils', () => {
  describe('formatResponse', () => {
    it('should format success response correctly', () => {
      const result = formatResponse('success', { id: 1 })
      expect(result).toEqual({
        status: 'success',
        data: { id: 1 }
      })
    })
  })
})
```

See [TESTING.md](./TESTING.md) for detailed testing guidelines.

## ⚙️ Configuration

The backend uses environment variables for configuration:

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/music_collab_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### Optional Variables
```bash
# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:5173

# AI Integration (Phase 8)
OPENAI_API_KEY=your-openai-key-here

# File Upload
MAX_FILE_SIZE=50mb
UPLOAD_PATH=./uploads
```

## 🗄️ Database

The backend uses PostgreSQL as the primary database with the following setup:

### Connection
```typescript
// src/config/database.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})
```

### Migrations (Coming Soon)
```bash
# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Create new migration
npm run migrate:create <name>
```

### Seeding (Coming Soon)
```bash
# Seed database
npm run seed

# Seed test data
npm run seed:test
```

## 🔐 Authentication & Security

### JWT Authentication
- JWT tokens for stateless authentication
- Refresh token rotation
- Password hashing with bcrypt
- Rate limiting on auth endpoints

### Security Middleware
- Helmet.js for security headers
- CORS configuration
- Request validation with Joi/Zod
- SQL injection prevention
- Input sanitization

## 🚀 Performance

### Optimization Strategies
- Database connection pooling
- Redis caching for sessions
- Request/response compression
- API response pagination
- Database query optimization

### Monitoring (Coming Soon)
- Request logging with Morgan
- Error tracking
- Performance metrics
- Health checks

## 🐳 Docker Support

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build Docker image
docker build -t music-collab-backend .

# Run container
docker run -p 3000:3000 --env-file .env music-collab-backend
```

## 📊 Development Status

### ✅ Completed (Phase 1)
- Express.js application setup
- TypeScript configuration
- Basic middleware (error handling, CORS)
- Health check endpoint
- Testing infrastructure with Jest
- Linting and formatting setup
- Development scripts and hot reload

### 🔄 In Progress (Phase 2)
- Database models and ORM setup
- PostgreSQL integration
- Migration system
- Basic CRUD operations

### 📅 Coming Soon
- **Phase 3**: User authentication system
- **Phase 4**: Project management APIs
- **Phase 5**: Track and audio management
- **Phase 6**: Real-time collaboration with WebSockets
- **Phase 7**: Audio processing capabilities
- **Phase 8**: AI integration APIs

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Write tests for new functionality
3. Implement the feature
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Jest**: Testing framework

### Pull Request Checklist
- [ ] Tests written and passing
- [ ] TypeScript compilation successful
- [ ] Linting passes without errors
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)

## 🔧 Troubleshooting

### Common Issues

**TypeScript compilation errors:**
```bash
npm run typecheck
```

**Database connection issues:**
```bash
# Check PostgreSQL is running
./dev-tools/dev-env.sh status

# Verify connection string
echo $DATABASE_URL
```

**Port already in use:**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

**Module not found errors:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debugging
```bash
# Start with debugging enabled
npm run dev:debug

# Or use VS Code debugger with launch.json
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

*For more information, see the [main project README](../README.md) and [project documentation](http://localhost:5173/docs).*
