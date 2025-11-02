import {
  buildOrderResponse,
  validateCreateOrder,
  ORDER_MESSAGES,
} from '../../src/lib/utils/order';
import { OrderStatus, PaymentStatus } from '../../src/lib/models/enums';

jest.mock('mongoose', () => ({
  isValidObjectId: jest.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id)),
}));

describe('order utils', () => {
  describe('buildOrderResponse', () => {
    it('should build order response correctly', () => {
      const mockOrder = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        datetime: new Date('2024-01-01'),
        status: OrderStatus.PENDING,
        totalAmount: 25.98,
        products: [
          {
            productId: { toString: () => '507f1f77bcf86cd799439013' },
            name: 'Product 1',
            price: 12.99,
            quantity: 2,
            img: 'product1.jpg',
            selectedOptions: [],
          },
        ],
        address: '123 Main St, New York, NY 10001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockPayment = {
        _id: { toString: () => '507f1f77bcf86cd799439014' },
        method: 'cash',
        status: PaymentStatus.PENDING,
        amount: 25.98,
      };

      const response = buildOrderResponse(mockOrder, mockPayment);

      expect(response).toEqual({
        id: '507f1f77bcf86cd799439011',
        customerId: '507f1f77bcf86cd799439012',
        datetime: mockOrder.datetime,
        status: OrderStatus.PENDING,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        totalAmount: 25.98,
        products: [
          {
            productId: '507f1f77bcf86cd799439013',
            name: 'Product 1',
            price: 12.99,
            quantity: 2,
            img: 'product1.jpg',
            subtotal: 25.98,
          },
        ],
        address: '123 Main St, New York, NY 10001',
        payment: {
          id: '507f1f77bcf86cd799439014',
          method: 'cash',
          status: PaymentStatus.PENDING,
          amount: 25.98,
        },
        canCancel: true,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should include selected options in product', () => {
      const mockOrder = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        datetime: new Date('2024-01-01'),
        status: OrderStatus.PENDING,
        totalAmount: 30.98,
        products: [
          {
            productId: { toString: () => '507f1f77bcf86cd799439013' },
            name: 'Product 1',
            price: 15.49,
            quantity: 2,
            img: 'product1.jpg',
            selectedOptions: [
              {
                optionValueId: { toString: () => 'opt1' },
                optionTypeName: 'Size',
                value: 'Large',
                price: 2.50,
              },
            ],
          },
        ],
        address: '123 Main St',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockPayment = {
        _id: { toString: () => '507f1f77bcf86cd799439014' },
        method: 'stripe',
        status: PaymentStatus.COMPLETED,
        amount: 30.98,
      };

      const response = buildOrderResponse(mockOrder, mockPayment);

      expect(response.products[0].selectedOptions).toHaveLength(1);
      expect(response.products[0].selectedOptions![0]).toEqual({
        optionValueId: 'opt1',
        optionTypeName: 'Size',
        value: 'Large',
        price: 2.50,
      });
    });

    it('should not include selectedOptions if empty', () => {
      const mockOrder = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        datetime: new Date('2024-01-01'),
        status: OrderStatus.PENDING,
        totalAmount: 10.99,
        products: [
          {
            productId: { toString: () => '507f1f77bcf86cd799439013' },
            name: 'Product 1',
            price: 10.99,
            quantity: 1,
            img: 'product1.jpg',
            selectedOptions: [],
          },
        ],
        address: '123 Main St',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockPayment = {
        _id: { toString: () => '507f1f77bcf86cd799439014' },
        method: 'cash',
        status: PaymentStatus.PENDING,
        amount: 10.99,
      };

      const response = buildOrderResponse(mockOrder, mockPayment);

      expect(response.products[0].selectedOptions).toBeUndefined();
    });

    it('should round subtotal to 2 decimal places', () => {
      const mockOrder = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        customerId: { toString: () => '507f1f77bcf86cd799439012' },
        datetime: new Date('2024-01-01'),
        status: OrderStatus.PENDING,
        totalAmount: 10.33,
        products: [
          {
            productId: { toString: () => '507f1f77bcf86cd799439013' },
            name: 'Product 1',
            price: 3.444,
            quantity: 3,
            img: 'product1.jpg',
            selectedOptions: [],
          },
        ],
        address: '123 Main St',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockPayment = {
        _id: { toString: () => '507f1f77bcf86cd799439014' },
        method: 'cash',
        status: PaymentStatus.PENDING,
        amount: 10.33,
      };

      const response = buildOrderResponse(mockOrder, mockPayment);

      expect(response.products[0].subtotal).toBe(10.33);
    });

    describe('canCancel flag', () => {
      it('should be true for PENDING status', () => {
        const mockOrder = {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          customerId: { toString: () => '507f1f77bcf86cd799439012' },
          datetime: new Date('2024-01-01'),
          status: OrderStatus.PENDING,
          totalAmount: 10.99,
          products: [],
          address: '123 Main St',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        };

        const mockPayment = {
          _id: { toString: () => '507f1f77bcf86cd799439014' },
          method: 'cash',
          status: PaymentStatus.PENDING,
          amount: 10.99,
        };

        const response = buildOrderResponse(mockOrder, mockPayment);

        expect(response.canCancel).toBe(true);
      });

      it('should be true for PROCESSING status', () => {
        const mockOrder = {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          customerId: { toString: () => '507f1f77bcf86cd799439012' },
          datetime: new Date('2024-01-01'),
          status: OrderStatus.PROCESSING,
          totalAmount: 10.99,
          products: [],
          address: '123 Main St',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        };

        const mockPayment = {
          _id: { toString: () => '507f1f77bcf86cd799439014' },
          method: 'cash',
          status: PaymentStatus.COMPLETED,
          amount: 10.99,
        };

        const response = buildOrderResponse(mockOrder, mockPayment);

        expect(response.canCancel).toBe(true);
      });

      it('should be false for SHIPPED status', () => {
        const mockOrder = {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          customerId: { toString: () => '507f1f77bcf86cd799439012' },
          datetime: new Date('2024-01-01'),
          status: OrderStatus.SHIPPED,
          totalAmount: 10.99,
          products: [],
          address: '123 Main St',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        };

        const mockPayment = {
          _id: { toString: () => '507f1f77bcf86cd799439014' },
          method: 'cash',
          status: PaymentStatus.COMPLETED,
          amount: 10.99,
        };

        const response = buildOrderResponse(mockOrder, mockPayment);

        expect(response.canCancel).toBe(false);
      });

      it('should be false for DELIVERED status', () => {
        const mockOrder = {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          customerId: { toString: () => '507f1f77bcf86cd799439012' },
          datetime: new Date('2024-01-01'),
          status: OrderStatus.DELIVERED,
          totalAmount: 10.99,
          products: [],
          address: '123 Main St',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        };

        const mockPayment = {
          _id: { toString: () => '507f1f77bcf86cd799439014' },
          method: 'cash',
          status: PaymentStatus.COMPLETED,
          amount: 10.99,
        };

        const response = buildOrderResponse(mockOrder, mockPayment);

        expect(response.canCancel).toBe(false);
      });

      it('should be false for CANCELLED status', () => {
        const mockOrder = {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          customerId: { toString: () => '507f1f77bcf86cd799439012' },
          datetime: new Date('2024-01-01'),
          status: OrderStatus.CANCELLED,
          totalAmount: 10.99,
          products: [],
          address: '123 Main St',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        };

        const mockPayment = {
          _id: { toString: () => '507f1f77bcf86cd799439014' },
          method: 'cash',
          status: PaymentStatus.FAILED,
          amount: 10.99,
        };

        const response = buildOrderResponse(mockOrder, mockPayment);

        expect(response.canCancel).toBe(false);
      });
    });
  });

  describe('validateCreateOrder', () => {
    it('should return empty array for valid data', () => {
      const data = {
        addressId: '507f1f77bcf86cd799439011',
        paymentMethod: 'cash' as const,
      };

      const errors = validateCreateOrder(data);

      expect(errors).toEqual([]);
    });

    it('should accept stripe payment method', () => {
      const data = {
        addressId: '507f1f77bcf86cd799439011',
        paymentMethod: 'stripe' as const,
      };

      const errors = validateCreateOrder(data);

      expect(errors).toEqual([]);
    });

    describe('addressId validation', () => {
      it('should return error for missing addressId', () => {
        const data = {
          addressId: '',
          paymentMethod: 'cash' as const,
        };

        const errors = validateCreateOrder(data);

        expect(errors).toContain('Address ID is required');
      });

      it('should return error for invalid addressId format', () => {
        const data = {
          addressId: 'invalid-id',
          paymentMethod: 'cash' as const,
        };

        const errors = validateCreateOrder(data);

        expect(errors).toContain('Invalid address ID');
      });
    });

    describe('paymentMethod validation', () => {
      it('should return error for missing paymentMethod', () => {
        const data = {
          addressId: '507f1f77bcf86cd799439011',
          paymentMethod: '' as any,
        };

        const errors = validateCreateOrder(data);

        expect(errors).toContain('Payment method is required');
      });

      it('should return error for invalid paymentMethod', () => {
        const data = {
          addressId: '507f1f77bcf86cd799439011',
          paymentMethod: 'paypal' as any,
        };

        const errors = validateCreateOrder(data);

        expect(errors).toContain("Payment method must be either 'cash' or 'stripe'");
      });
    });

    it('should return multiple errors for invalid data', () => {
      const data = {
        addressId: 'invalid',
        paymentMethod: 'invalid' as any,
      };

      const errors = validateCreateOrder(data);

      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('ORDER_MESSAGES', () => {
    it('should have all required message constants', () => {
      expect(ORDER_MESSAGES.CREATED).toBe('Order created successfully');
      expect(ORDER_MESSAGES.RETRIEVED).toBe('Order retrieved successfully');
      expect(ORDER_MESSAGES.LIST_RETRIEVED).toBe('Orders retrieved successfully');
      expect(ORDER_MESSAGES.CANCELLED).toBe('Order cancelled successfully');
      expect(ORDER_MESSAGES.CANNOT_CANCEL).toBe('Order cannot be cancelled in current status');
      expect(ORDER_MESSAGES.EMPTY_CART).toBe('Cart is empty');
      expect(ORDER_MESSAGES.INSUFFICIENT_STOCK).toBe('Insufficient stock for one or more products');
      expect(ORDER_MESSAGES.ORDER_NOT_FOUND).toBe('Order not found');
      expect(ORDER_MESSAGES.ADDRESS_NOT_FOUND).toBe('Address not found');
      expect(ORDER_MESSAGES.PAYMENT_FAILED).toBe('Payment processing failed');
    });
  });
});
