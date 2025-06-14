#!/bin/bash

# Music Collaboration Platform - Test Runner
# This script runs all tests across the project

set -e

echo "🧪 Running Music Collaboration Platform Test Suite"
echo "================================================="

# Check if we're in the project root
if [ ! -f "PROJECT-PLAN.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to run tests in a directory
run_tests() {
    local dir=$1
    local name=$2
    local command=$3
    
    echo ""
    echo "🔧 Running $name tests..."
    echo "-----------------------------"
    
    if [ -d "$dir" ]; then
        cd "$dir"
        if [ -f "package.json" ]; then
            npm ci --silent > /dev/null 2>&1 || true
            eval "$command"
        else
            echo "⚠️  No package.json found in $dir"
        fi
        cd ..
    else
        echo "⚠️  Directory $dir not found"
    fi
}

# Run backend tests
run_tests "backend" "Backend" "npm test"

# Run frontend tests
run_tests "frontend" "Frontend" "npm run test:unit -- --run"

# Run E2E tests only if both frontend and backend tests pass
echo ""
echo "🌐 Running E2E tests..."
echo "-------------------------"

if [ -d "e2e-tests" ]; then
    cd e2e-tests
    npm ci --silent > /dev/null 2>&1 || true
    
    # Check if services are running, if not start them
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "⚠️  Backend not running. Please start the backend service first."
        echo "   Run: cd backend && npm run dev"
    fi
    
    if ! curl -s http://localhost:5175 > /dev/null 2>&1; then
        echo "⚠️  Frontend not running. Please start the frontend service first."
        echo "   Run: cd frontend && npm run dev"
    fi
    
    # Run E2E tests
    npm test -- --project=chromium
    cd ..
else
    echo "⚠️  E2E tests directory not found"
fi

echo ""
echo "✅ All tests completed!"
echo "======================"
