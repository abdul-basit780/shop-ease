import { buildCustomerResponse } from '../../src/lib/utils/customer';

describe('customer utils', () => {
  describe('buildCustomerResponse', () => {
    it('should build customer response correctly', () => {
      const mockCustomer = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        dob: '1990-01-01',
        gender: 'male',
      };

      const response = buildCustomerResponse(mockCustomer);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        dob: '1990-01-01',
        gender: 'male',
      });
    });

    it('should handle different genders', () => {
      const mockCustomer = {
        _id: { toString: () => '507f1f77bcf86cd799439012' },
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1234567891',
        dob: '1995-05-15',
        gender: 'female',
      };

      const response = buildCustomerResponse(mockCustomer);

      expect(response.gender).toBe('female');
    });

    it('should convert ObjectId to string', () => {
      const mockCustomer = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        dob: '1990-01-01',
        gender: 'male',
      };

      const response = buildCustomerResponse(mockCustomer);

      expect(typeof response.id).toBe('string');
      expect(response.id).toBe('507f1f77bcf86cd799439011');
    });

    it('should include all required customer fields', () => {
      const mockCustomer = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Test User',
        email: 'test@example.com',
        phone: '+9876543210',
        dob: '1985-12-31',
        gender: 'other',
      };

      const response = buildCustomerResponse(mockCustomer);

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('email');
      expect(response).toHaveProperty('phone');
      expect(response).toHaveProperty('dob');
      expect(response).toHaveProperty('gender');
    });
  });
});
