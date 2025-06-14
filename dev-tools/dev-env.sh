#!/bin/bash

# Music Collaboration Platform - Development Environment Scripts
# This script provides convenient commands for managing the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to start development environment
start_dev() {
    echo_info "Starting development environment..."
    cd "$SCRIPT_DIR"
    
    if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
        echo_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Use docker compose (newer) or docker-compose (older)
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose up -d
    elif command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        echo_error "Neither 'docker compose' nor 'docker-compose' is available."
        exit 1
    fi
    
    echo_success "Development environment started!"
    echo_info "Services available at:"
    echo "  • PostgreSQL: localhost:5432"
    echo "  • Redis: localhost:6379"
    echo "  • pgAdmin: http://localhost:5050"
    echo "  • Redis Commander: http://localhost:8081"
    echo ""
    echo_info "Default credentials are in .env.example"
}

# Function to stop development environment
stop_dev() {
    echo_info "Stopping development environment..."
    cd "$SCRIPT_DIR"
    
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose down
    elif command -v docker-compose &> /dev/null; then
        docker-compose down
    fi
    
    echo_success "Development environment stopped!"
}

# Function to reset development environment
reset_dev() {
    echo_warning "This will destroy all data in the development environment!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo_info "Resetting development environment..."
        cd "$SCRIPT_DIR"
        
        if command -v docker &> /dev/null && docker compose version &> /dev/null; then
            docker compose down -v --remove-orphans
            docker compose up -d
        elif command -v docker-compose &> /dev/null; then
            docker-compose down -v --remove-orphans
            docker-compose up -d
        fi
        
        echo_success "Development environment reset!"
    else
        echo_info "Reset cancelled."
    fi
}

# Function to show logs
logs_dev() {
    cd "$SCRIPT_DIR"
    
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose logs -f
    elif command -v docker-compose &> /dev/null; then
        docker-compose logs -f
    fi
}

# Function to show status
status_dev() {
    cd "$SCRIPT_DIR"
    
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose ps
    elif command -v docker-compose &> /dev/null; then
        docker-compose ps
    fi
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        stop_dev
        start_dev
        ;;
    reset)
        reset_dev
        ;;
    logs)
        logs_dev
        ;;
    status)
        status_dev
        ;;
    help|*)
        echo "Music Collaboration Platform - Development Environment"
        echo ""
        echo "Usage: $0 {start|stop|restart|reset|logs|status|help}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the development environment"
        echo "  stop     - Stop the development environment"
        echo "  restart  - Restart the development environment"
        echo "  reset    - Reset the development environment (destroys data)"
        echo "  logs     - Show logs from all services"
        echo "  status   - Show status of all services"
        echo "  help     - Show this help message"
        echo ""
        echo "Services included:"
        echo "  • PostgreSQL (port 5432)"
        echo "  • Redis (port 6379)"
        echo "  • pgAdmin (port 5050)"
        echo "  • Redis Commander (port 8081)"
        ;;
esac
