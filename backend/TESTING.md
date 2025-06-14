# Backend Testing Guide

## Test Structure

Tests are co-located with the source files they test. This makes it easier to find and maintain tests alongside the code.

### File Naming Convention
- Source file: `example.ts`
- Test file: `example.test.ts`

### Example Structure
```
src/
├── app.ts                 # Express application
├── app.test.ts           # Tests for app.ts
├── utils/
│   ├── index.ts          # Utility functions
│   └── index.test.ts     # Tests for utils
├── services/
│   ├── userService.ts    # User business logic
│   └── userService.test.ts # Tests for user service
└── controllers/
    ├── userController.ts
    └── userController.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/utils/index.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="validation"
```

## Writing Tests

### Example Test Structure
```typescript
import { functionToTest } from './sourceFile';

describe('Component/Function Name', () => {
  describe('specific behavior', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Test Categories
- **Unit Tests**: Test individual functions/methods
- **Integration Tests**: Test component interactions
- **API Tests**: Test HTTP endpoints (using supertest)

### Best Practices
1. Use descriptive test names
2. Follow Arrange-Act-Assert pattern
3. Keep tests focused and atomic
4. Mock external dependencies
5. Test both success and error cases
6. Include edge cases and boundary tests

## Jest Configuration

The Jest configuration excludes test files from TypeScript compilation and coverage:
- Tests are not included in the build output
- Coverage reports exclude test files
- Test files use the same module resolution as source files
