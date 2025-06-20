---
mode: agent
---
# Music Collaboration Platform - AI Assistant Prompt

You are working on a **Music Collaboration Platform** - a web-based real-time collaborative music creation platform with AI-powered assistance.

- **Backend**: Node.js, TypeScript, Express, PostgreSQL, Redis, Prisma ORM, Socket.IO
- **Frontend**: Vue.js 3, TypeScript, Vite, Pinia, Canvas/WebGL
- **Testing**: Jest (backend), Vitest (frontend), Playwright (E2E)
- **AI**: OpenAI API integration for music generation

## 📁 Project Structure
```
music-collab/
├── backend/           # Node.js/TypeScript API
├── frontend/          # Vue.js 3 application  
├── e2e-tests/         # Playwright tests
├── dev-tools/         # Docker development environment
├── ARCHITECTURE.md    # System architecture
├── PROJECT-PLAN.md    # Development phases
└── CODING-GUIDELINES.md # Coding standards
```

## 🚀 Key Commands

**Development Environment:**
```bash
./dev-tools/dev-env.sh start    # Start PostgreSQL + Redis containers
./test-all.sh                   # Run all tests across the project
```

**Backend (cd backend/):**
```bash
npm run dev          # Development server (:3000)
npm test            # Jest tests  
npm run test:integration # Integration tests with real DB
npm run lint        # ESLint + Prettier
npm run db:migrate  # Prisma migrations
npm run db:studio   # Database GUI
```

**Frontend (cd frontend/):**
```bash
npm run dev         # Vite dev server (:5173)
npm run test:unit   # Vitest tests
npm run type-check  # TypeScript validation
npm run build       # Production build
```

**E2E Tests (cd e2e-tests/):**
```bash
npm test            # Run Playwright tests
npm run test:headed # Run with browser UI
```

## 🧪 Testing Standards
- **Co-located tests**: Place `.test.ts` files adjacent to source files
- **AAA Pattern**: Arrange, Act, Assert structure required
- **Integration tests**: Use real database for auth/RBAC validation
- **Coverage**: 80%+ backend, 70%+ frontend minimum

## 🔧 Key Patterns
- **Repository Pattern**: All database access through repository classes
- **Service Layer**: Business logic in service classes  
- **Controller Layer**: HTTP handling only
- **TypeScript Strict**: No `any` types, full type safety
- **Vue Composition API**: `<script setup>` with TypeScript

## 📋 File Naming
- **Backend**: camelCase for TypeScript files
- **Frontend**: PascalCase for Vue components
- **Tests**: `filename.test.ts` or `filename.spec.ts`

## 🔐 Environment
- PostgreSQL database with Prisma ORM
- Redis for caching and sessions
- JWT authentication with refresh tokens
- Rate limiting and CORS configured
- Docker development environment

## 📚 Documentation
Document each phase as we go.

Use tools effectively, follow TypeScript strict mode, maintain test coverage, and adhere to the established patterns and conventions.
