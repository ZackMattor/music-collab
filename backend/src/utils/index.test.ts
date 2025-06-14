import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateEmail, 
  validatePassword,
  generateId 
} from './index';

describe('Utility Functions', () => {
  describe('createSuccessResponse', () => {
    it('should create a successful API response', () => {
      const data = { id: '123', name: 'Test' };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should include meta information when provided', () => {
      const data = { id: '123' };
      const meta = { 
        pagination: { page: 1, limit: 10, total: 100, totalPages: 10 }
      };
      const response = createSuccessResponse(data, meta);

      expect(response.meta?.pagination).toEqual(meta.pagination);
      expect(response.meta?.timestamp).toBeDefined();
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error API response', () => {
      const message = 'Something went wrong';
      const response = createErrorResponse(message);

      expect(response.success).toBe(false);
      expect(response.error?.message).toBe(message);
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should include error code and details when provided', () => {
      const message = 'Validation failed';
      const code = 'VALIDATION_ERROR';
      const details = { field: 'email' };
      const response = createErrorResponse(message, code, details);

      expect(response.error?.message).toBe(message);
      expect(response.error?.code).toBe(code);
      expect(response.error?.details).toEqual(details);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123')).toBe(true);
      expect(validatePassword('MySecure1Password')).toBe(true);
      expect(validatePassword('Test123!')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('lowercase123')).toBe(false);
      expect(validatePassword('UPPERCASE123')).toBe(false);
      expect(validatePassword('NoNumbers!')).toBe(false);
      expect(validatePassword('Short1')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs with reasonable length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(50);
    });
  });
});
