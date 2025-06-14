# Music Collaboration Platform

A web-based collaborative music creation platform that enables musicians to work together in real-time, with AI-powered assistance for music composition and arrangement.

## Project Documents

- [Requirements Document](./REQUIREMENTS.md) - Project vision, features, and goals
- [Architecture Document](./ARCHITECTURE.md) - Technical architecture and data models
- [Project Plan](./PROJECT-PLAN.md) - Development phases and timeline

## Development Setup

### Prerequisites

- **Docker & Docker Compose** - For running development services
- **Node.js 18+** - For backend and frontend development
- **Git** - Version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd music-collab
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

3. **Start development services**
   ```bash
   ./dev-tools/dev-env.sh start
   ```

4. **Verify services are running**
   ```bash
   ./dev-tools/dev-env.sh status
   ```

### Development Services

The development environment includes the following services:

| Service | URL | Purpose | Credentials |
|---------|-----|---------|-------------|
| PostgreSQL | `localhost:5432` | Primary database | `dev_user` / `dev_password` |
| Redis | `localhost:6379` | Caching & sessions | Password: `dev_redis_password` |
| pgAdmin | http://localhost:5050 | Database management | `admin@example.com` / `admin_password` |
| Redis Commander | http://localhost:8081 | Redis management | `admin` / `admin_password` |

### Development Environment Management

Use the provided script to manage your development environment:

```bash
# Start all services
./dev-tools/dev-env.sh start

# Stop all services
./dev-tools/dev-env.sh stop

# Restart all services
./dev-tools/dev-env.sh restart

# Reset environment (destroys all data)
./dev-tools/dev-env.sh reset

# View logs
./dev-tools/dev-env.sh logs

# Check service status
./dev-tools/dev-env.sh status
```

### Project Structure

```
music-collab/
├── README.md                   # This file
├── REQUIREMENTS.md             # Project requirements
├── ARCHITECTURE.md             # Technical architecture
├── PROJECT-PLAN.md             # Development plan
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── dev-tools/                  # Development environment
│   ├── docker-compose.yml      # Docker services configuration
│   ├── dev-env.sh              # Development environment script
│   └── init-scripts/           # Database initialization scripts
├── backend/                    # Backend application (coming soon)
├── frontend/                   # Frontend application (coming soon)
└── docs/                       # Additional documentation (coming soon)
```

## Development Workflow

### Current Phase: Project Scaffolding (Phase 1.1)

We're currently in Phase 1.1 of the project plan, setting up the development environment and project scaffolding.

**Completed:**
- ✅ Docker Compose configuration for development services
- ✅ Environment variable templates
- ✅ Development environment management scripts
- ✅ Basic project documentation

**Next Steps:**
- [ ] Backend TypeScript project initialization
- [ ] Frontend Vue.js project initialization
- [ ] Testing infrastructure setup
- [ ] CI/CD pipeline configuration

### Git Workflow

1. Create feature branches from `main`
2. Make small, focused commits
3. Write descriptive commit messages
4. Create pull requests for review
5. Ensure all tests pass before merging

### Code Standards

- **TypeScript** - Strict mode enabled
- **ESLint** - For code linting
- **Prettier** - For code formatting
- **Jest/Vitest** - For testing
- **Conventional Commits** - For commit messages

## Environment Variables

Copy `.env.example` to `.env` and configure the following key variables:

### Required for Development
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Required for AI Features (Phase 8)
- `OPENAI_API_KEY` - OpenAI API key for AI music generation

### Optional Configuration
- `PORT` - Application port (default: 3000)
- `LOG_LEVEL` - Logging level (default: debug)
- `CORS_ORIGIN` - CORS allowed origins

See `.env.example` for a complete list of available configuration options.

## Troubleshooting

### Docker Issues

**Services won't start:**
```bash
# Check if ports are already in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5050  # pgAdmin
lsof -i :8081  # Redis Commander

# Kill processes using the ports if needed
sudo kill -9 <PID>
```

**Permission issues:**
```bash
# Reset Docker volumes
./dev-tools/dev-env.sh reset
```

**Connection issues:**
```bash
# Check service logs
./dev-tools/dev-env.sh logs

# Check service status
./dev-tools/dev-env.sh status
```

### Database Issues

**Can't connect to PostgreSQL:**
1. Ensure Docker containers are running
2. Check the connection string in `.env`
3. Verify credentials match `docker-compose.yml`

**Database initialization fails:**
1. Check logs: `./dev-tools/dev-env.sh logs`
2. Reset environment: `./dev-tools/dev-env.sh reset`

## Contributing

1. Read the [Requirements](./REQUIREMENTS.md) and [Architecture](./ARCHITECTURE.md) documents
2. Check the [Project Plan](./PROJECT-PLAN.md) for current priorities
3. Set up the development environment following this README
4. Create a feature branch for your changes
5. Write tests for new functionality
6. Ensure all existing tests pass
7. Submit a pull request with a clear description

## Support

For development questions or issues:
1. Check this README and project documentation
2. Review the troubleshooting section
3. Check existing GitHub issues
4. Create a new issue with detailed information

## License

[License information to be added]

---

*Last updated: June 14, 2025*
