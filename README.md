# Music Collaboration Platform

A web-based collaborative music creation platform that enables musicians to work together in real-time, with AI-powered assistance for music composition and arrangement.

## 🎵 Overview

This platform allows musicians to:
- Collaborate on music projects in real-time
- Create and edit MIDI and audio tracks together
- Use AI-powered composition assistance
- Share projects and manage collaborations
- Export finished compositions

## 📋 Project Documentation

- **[Requirements Document](./REQUIREMENTS.md)** - Project vision, features, and user stories
- **[Architecture Document](./ARCHITECTURE.md)** - Technical architecture and system design
- **[Project Plan](./PROJECT-PLAN.md)** - Development phases and timeline
- **[Documentation System](http://localhost:5173/docs)** - Interactive project documentation

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** - For development services
- **Node.js 18+** - For backend and frontend development
- **Git** - Version control

### 1. Clone and Setup
```bash
git clone <repository-url>
cd music-collab
cp .env.example .env
# Edit .env with your settings
```

### 2. Start Development Environment
```bash
# Start all services (PostgreSQL, Redis, pgAdmin, Redis Commander)
./dev-tools/dev-env.sh start

# Verify services are running
./dev-tools/dev-env.sh status
```

### 3. Start Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:3000
```

### 4. Start Frontend (Terminal 2)
```bash
cd frontend
npm install  
npm run dev
# Frontend runs on http://localhost:5173
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Documentation**: http://localhost:5173/docs
- **pgAdmin**: http://localhost:5050 (`admin@example.com` / `admin_password`)
- **Redis Commander**: http://localhost:8081 (`admin` / `admin_password`)

## 🏗️ Project Structure

```
music-collab/
├── README.md                   # This overview
├── REQUIREMENTS.md             # Project requirements  
├── ARCHITECTURE.md             # Technical architecture
├── PROJECT-PLAN.md             # Development timeline
├── backend/                    # Node.js/TypeScript API
│   ├── README.md              # Backend-specific documentation
│   ├── src/                   # Source code
│   ├── package.json           # Dependencies and scripts
│   └── TESTING.md             # Testing guide
├── frontend/                   # Vue.js 3/TypeScript UI
│   ├── README.md              # Frontend-specific documentation
│   ├── src/                   # Source code
│   ├── package.json           # Dependencies and scripts
│   └── vite.config.ts         # Build configuration
├── e2e-tests/                  # End-to-end tests
├── dev-tools/                  # Development environment
│   ├── docker-compose.yml     # Service definitions
│   └── dev-env.sh             # Environment management
└── .env.example               # Environment variables template
```

## 🛠️ Development Services

| Service | URL | Purpose | Credentials |
|---------|-----|---------|-------------|
| PostgreSQL | `localhost:5432` | Primary database | `dev_user` / `dev_password` |
| Redis | `localhost:6379` | Caching & sessions | `dev_redis_password` |
| pgAdmin | http://localhost:5050 | Database management | `admin@example.com` / `admin_password` |
| Redis Commander | http://localhost:8081 | Redis management | `admin` / `admin_password` |

**Environment Management:**
```bash
./dev-tools/dev-env.sh start    # Start all services
./dev-tools/dev-env.sh stop     # Stop all services  
./dev-tools/dev-env.sh status   # Check service status
./dev-tools/dev-env.sh logs     # View service logs
./dev-tools/dev-env.sh reset    # Reset all data
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Unit tests only (excludes integration tests)
npm run test:unit

# Integration tests (with real database)
npm run test:integration

# Test with coverage reports
npm run test:coverage

# Watch mode for development
npm run test:watch

# Database setup for integration tests
npm run test:db:setup
```

### Frontend Testing
```bash
cd frontend

# Unit tests with Vitest
npm run test:unit

# Tests with coverage
npm run test:coverage

# Type checking
npm run type-check
```

### End-to-End Testing
```bash
cd e2e-tests

# Run all E2E tests with Playwright
npm test

# Run tests in headed mode (browser visible)
npx playwright test --headed

# Run specific test file
npx playwright test tests/music-platform.spec.ts
```

### Test Database Management
```bash
# Setup test database (automatically run with integration tests)
cd backend && npm run test:db:setup

# Reset main development database
cd backend && npm run db:reset

# View database in Prisma Studio
cd backend && npm run db:studio
```

## 🤝 Contributing

1. Read the project documentation ([Requirements](./REQUIREMENTS.md), [Architecture](./ARCHITECTURE.md))
2. Check the [Project Plan](./PROJECT-PLAN.md) for current priorities
3. Set up the development environment following this guide
4. Create a feature branch for your changes
5. Write tests for new functionality
6. Submit a pull request with a clear description

## 📚 Additional Resources

- **[Backend README](./backend/README.md)** - Backend development guide
- **[Frontend README](./frontend/README.md)** - Frontend development guide
- **[Testing Guide](./backend/TESTING.md)** - Testing practices and patterns
- **[Interactive Documentation](http://localhost:5173/docs)** - Live project documentation

## 🐛 Troubleshooting

**Services won't start:**
```bash
# Check if ports are already in use
lsof -i :5432 :6379 :5050 :8081

# Reset environment
./dev-tools/dev-env.sh reset
```

**Database connection issues:**
```bash
# Check service logs
./dev-tools/dev-env.sh logs

# Verify environment variables
cat .env
```

## 📄 License

[License information to be added]

---

*Last updated: June 15, 2025*
