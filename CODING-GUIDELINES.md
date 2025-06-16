# Music Collaboration Platform - Coding Guidelines

## 📖 Overview

This document outlines the coding standards, best practices, and development conventions for the Music Collaboration Platform. Following these guidelines ensures code consistency, maintainability, and quality across the entire project.

## 🎵 Project Summary

The Music Collaboration Platform is a web-based collaborative music creation platform that enables musicians to work together in real-time, with AI-powered assistance for music composition and arrangement.

### Technology Stack
- **Backend**: Node.js, TypeScript, Express.js, PostgreSQL, Redis
- **Frontend**: Vue.js 3, TypeScript, Vite, Pinia
- **Testing**: Jest (backend), Vitest (frontend), Playwright (E2E)
- **Database**: Prisma ORM with PostgreSQL
- **Real-time**: Socket.IO for WebSocket communication
- **CI/CD**: GitHub Actions with automated testing and quality checks

## 📁 File Organization & Structure

### 1. Test File Co-location
**✅ REQUIRED**: Test files must be placed adjacent to their source files.

```
src/
├── controllers/
│   ├── AuthController.ts
│   └── AuthController.test.ts        ← Co-located test
├── services/
│   ├── auth.ts
│   └── auth.test.ts                  ← Co-located test
└── utils/
    ├── index.ts
    └── index.test.ts                 ← Co-located test
```

**File Naming Convention:**
- Source file: `example.ts`
- Test file: `example.test.ts` (backend) or `example.spec.ts` (frontend)

### 2. Project Structure Standards
```
music-collab/
├── ARCHITECTURE.md              # System architecture documentation
├── PROJECT-PLAN.md             # Development phases and timeline
├── CODING-GUIDELINES.md        # This document
├── backend/                    # Node.js/TypeScript API
│   ├── src/                   # Source code with co-located tests
│   ├── prisma/                # Database schema and migrations
│   └── README.md              # Backend-specific documentation
├── frontend/                   # Vue.js 3/TypeScript application
│   ├── src/                   # Source code with co-located tests
│   └── README.md              # Frontend-specific documentation
├── e2e-tests/                  # End-to-end tests
└── dev-tools/                  # Development environment setup
```

## 🧪 Testing Standards

### 1. Testing Framework Usage
- **Backend**: Jest with TypeScript support
- **Frontend**: Vitest for unit/integration tests
- **E2E**: Playwright for cross-browser testing

### 2. Test Structure - Arrange, Act, Assert (AAA) Pattern
**✅ REQUIRED**: All tests must follow the AAA pattern for clarity and consistency.

```typescript
describe('AuthController', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'securepassword123'
      };
      mockAuthService.register.mockResolvedValue({ user: mockUser, tokens: mockTokens });

      // Act
      await authController.register(mockReq, mockRes);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
```

### 3. Test Categories & Coverage
- **Unit Tests**: Individual functions/methods (aim for 90%+ coverage)
- **Integration Tests**: Component interactions with real database
- **API Tests**: HTTP endpoints with supertest
- **E2E Tests**: User journeys across the full application

### 4. Integration Testing Standards
**✅ REQUIRED**: Integration tests must use real database operations for authentication and RBAC validation.

#### Test Database Setup
```typescript
// Use dedicated test database infrastructure
import { TestIntegrationSetup } from './test-utils/test-integration-setup';
import { DatabaseSeeder } from './test-utils/database-seeder';

describe('Authentication Integration Tests', () => {
  let seeder: DatabaseSeeder;

  beforeAll(async () => {
    await TestIntegrationSetup.beforeAll(); // Initialize test database
    seeder = TestIntegrationSetup.getSeeder();
  });

  beforeEach(async () => {
    await TestIntegrationSetup.beforeEach(); // Clean database state
  });

  afterAll(async () => {
    await TestIntegrationSetup.afterAll(); // Cleanup connections
  });
});
```

#### Database Seeding for Tests
```typescript
// Create test users with real database operations
const userData = {
  email: 'test@musiccollab.test',
  displayName: 'Test User',
  password: 'TestPassword123!'
};

const user = await seeder.createUser(userData);
```

#### Authentication Flow Testing
- Test complete authentication flows with database persistence
- Validate JWT tokens against actual user records
- Test user registration, login, profile management, and account deletion
- Verify proper error handling for invalid credentials and missing users
- Test rate limiting bypass in test environment

### 5. Testing Best Practices
- Use descriptive test names that explain the behavior
- Keep tests focused and atomic (one assertion per test when possible)
- Mock external dependencies appropriately (but use real database for integration tests)
- Test both success and error cases
- Include edge cases and boundary conditions
- Maintain test isolation (no shared state between tests)
- Disable rate limiting and other middleware in test environment

## 📋 Documentation Standards

### 1. Phase Completion Documentation
**✅ REQUIRED**: When completing a project plan phase, create a completion document.

**Naming Convention**: `PHASE-{X}-COMPLETE.md` or `PHASE-{X}.{Y}-COMPLETE.md`

**Required Sections:**
```markdown
# Phase X.Y [Phase Name] - COMPLETE

## 🎯 Phase Summary
Brief description of what was accomplished

## ✅ Completed Tasks
- Detailed list of completed tasks
- Organized by category/component

## 📊 Test Results
- Test coverage metrics
- Number of tests written
- Quality metrics achieved

## 🚀 Next Steps
- Immediate next actions
- Dependencies for next phase
- Any blockers or considerations

## 📁 File Structure
- New files created
- Modified files
- Architecture changes
```

### 2. README Documentation
Each component must maintain its own README with:
- Quick start instructions
- Architecture overview
- Development commands
- Testing instructions
- Troubleshooting guide

### 3. Code Documentation
- **TypeScript Interfaces**: Document complex interfaces with JSDoc
- **API Endpoints**: Document with OpenAPI/Swagger comments
- **Business Logic**: Comment complex algorithms and business rules
- **Configuration**: Document environment variables and setup

## 💻 Code Style & Quality

### 1. TypeScript Standards
- **Strict Mode**: Always enabled (`strict: true` in tsconfig.json)
- **Type Safety**: Avoid `any` type when possible, use proper typing
- **Interfaces**: Define interfaces for all data structures
- **Enums**: Use for fixed sets of values

### 2. ESLint & Prettier Configuration
**Backend (.eslintrc.js)**:
```javascript
rules: {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/explicit-function-return-type': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-non-null-assertion': 'error',
  'prefer-const': 'error',
  'no-var': 'error'
}
```

**Frontend (eslint.config.ts)**:
- Vue 3 ESLint configuration
- TypeScript strict rules
- Vitest plugin for test files

### 3. Naming Conventions
- **Files**: camelCase for TypeScript files, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Classes**: PascalCase
- **Interfaces**: PascalCase (no "I" prefix)
- **Types**: PascalCase with "Type" suffix if needed

### 4. Import/Export Standards
```typescript
// Preferred: Named exports
export const AuthController = class { ... }
export const validateUser = (user: User) => { ... }

// Use default exports sparingly (mainly for Vue components)
export default defineComponent({ ... })

// Group imports logically
import { Request, Response } from 'express'
import { AuthService } from '../services/auth'
import { User } from '../types'
```

## 🏗️ Architecture Patterns

### 1. Repository Pattern (Backend)
All data access must go through repository classes:
```typescript
export interface UserRepositoryInterface {
  findById(id: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
}
```

### 2. Service Layer Pattern
Business logic belongs in service classes:
```typescript
export class AuthService {
  constructor(
    private userRepository: UserRepositoryInterface,
    private tokenService: TokenService
  ) {}

  async register(data: RegisterData): Promise<AuthResult> {
    // Business logic here
  }
}
```

### 3. Controller Layer Pattern
Controllers handle HTTP concerns only:
```typescript
export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.register(req.body)
      res.status(201).json(result)
    } catch (error) {
      // Error handling
    }
  }
}
```

### 4. Component Architecture (Frontend)
```vue
<template>
  <!-- Template here -->
</template>

<script setup lang="ts">
// Composition API with TypeScript
import { ref, computed } from 'vue'
import type { User } from '@/types'

// Props with TypeScript
interface Props {
  user: User
}
const props = defineProps<Props>()

// Reactive state
const isLoading = ref(false)

// Computed properties
const displayName = computed(() => props.user.displayName || props.user.username)
</script>
```

## 🔒 Security & Error Handling

### 1. Input Validation
- Validate all user inputs at the API boundary
- Use TypeScript types for compile-time validation
- Implement runtime validation with libraries like Zod

### 2. Error Handling Standards
```typescript
// Service layer - throw meaningful errors
if (!user) {
  throw new Error('User not found')
}

// Controller layer - handle and format errors
try {
  const result = await this.service.method()
  res.json(result)
} catch (error) {
  const message = error instanceof Error ? error.message : 'Operation failed'
  res.status(500).json({
    error: 'Service Error',
    message
  })
}
```

### 3. Security Best Practices
- Never expose password hashes in API responses
- Use parameterized queries (Prisma handles this)
- Validate JWT tokens on protected routes
- Implement proper CORS configuration
- Rate limit API endpoints

## 🚀 Development Workflow

### 1. Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/description`: Feature development branches
- `hotfix/description`: Critical bug fixes

### 2. Commit Message Format
Follow Conventional Commits:
```
feat: add user authentication endpoints
fix: resolve token refresh issue
docs: update API documentation
test: add auth controller tests
refactor: extract validation logic
```

### 3. Pull Request Checklist
- [ ] Tests written and passing
- [ ] TypeScript compilation successful
- [ ] Linting passes without errors
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Code reviewed and approved

### 4. Development Commands
**Backend:**
```bash
npm run dev          # Development server with hot reload
npm test             # Run all tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Coverage report
npm run lint         # ESLint check
npm run format       # Prettier formatting
```

**Frontend:**
```bash
npm run dev          # Development server
npm run test:unit    # Unit tests
npm run test:unit:watch # Tests in watch mode
npm run build        # Production build
npm run lint         # ESLint check
```

## 📊 Performance & Quality Standards

### 1. Code Coverage Targets
- **Backend**: Minimum 80% overall, 90%+ for critical business logic
- **Frontend**: Minimum 70% for composables and utilities
- **E2E**: Cover all critical user journeys

### 2. Bundle Size Limits
- **Frontend Main Bundle**: < 1MB compressed
- **Frontend Code Splitting**: Implement for large features
- **Backend**: No specific limits, but monitor cold start times

### 3. Performance Monitoring
- Database query optimization with proper indexing
- API response time monitoring
- Frontend bundle analysis
- Memory usage monitoring

## 🔧 Environment Configuration

### 1. Environment Variables
Document all required environment variables:
```bash
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
NODE_ENV=development

# Optional
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

### 2. Configuration Management
- Use `.env.example` files for templates
- Never commit secrets to version control
- Use different configurations per environment
- Document all configuration options

## 📚 Additional Best Practices

### 1. Database Migrations
- Always use migrations for schema changes
- Include rollback strategies
- Test migrations on staging before production
- Keep migrations atomic and reversible

### 2. API Versioning
- Version APIs when breaking changes are introduced
- Use URL versioning: `/api/v1/users`
- Maintain backward compatibility when possible
- Document deprecation timelines

### 3. Logging & Monitoring
- Use structured logging (JSON format)
- Include request IDs for tracing
- Log errors with appropriate context
- Monitor application metrics

### 4. Cache Strategy
- Use Redis for session storage and temporary data
- Implement cache invalidation strategies
- Cache expensive database queries
- Monitor cache hit rates

---

## 🎯 Key Takeaways

1. **Test files must be adjacent to source files** - This is a strict requirement
2. **Follow Arrange-Act-Assert pattern** - All tests must use AAA structure
3. **Document phase completions** - Create completion documents for project plan phases
4. **Maintain high code quality** - Use TypeScript strict mode, ESLint, and Prettier
5. **Security first** - Validate inputs, handle errors properly, never expose sensitive data
6. **Performance matters** - Monitor bundle sizes, query performance, and coverage metrics

---

*Document Version: 1.0*  
*Last Updated: June 15, 2025*  
*Status: Active - Living Document*
