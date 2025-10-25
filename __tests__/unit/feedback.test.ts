import {
  FEEDBACK_MESSAGES,
  validateCreateFeedback,
  validateUpdateFeedback,
  buildFeedbackFilter,
  buildFeedbackSort,
} from '../../src/lib/utils/feedback';

describe('feedback utils', () => {
  describe('FEEDBACK_MESSAGES', () => {
    it('should have all required message constants', () => {
      expect(FEEDBACK_MESSAGES.CREATED).toBe('Feedback created successfully');
      expect(FEEDBACK_MESSAGES.UPDATED).toBe('Feedback updated successfully');
      expect(FEEDBACK_MESSAGES.DELETED).toBe('Feedback deleted successfully');
      expect(FEEDBACK_MESSAGES.RETRIEVED).toBe('Feedbacks retrieved successfully');
      expect(FEEDBACK_MESSAGES.NOT_FOUND).toBe('Feedback not found');
      expect(FEEDBACK_MESSAGES.ALREADY_REVIEWED).toBe('You have already reviewed this product');
      expect(FEEDBACK_MESSAGES.PRODUCT_NOT_PURCHASED).toBe(
        'You can only review products you have purchased'
      );
      expect(FEEDBACK_MESSAGES.ORDER_NOT_FOUND).toBe('Order not found or not completed');
      expect(FEEDBACK_MESSAGES.INVALID_PRODUCT_ID).toBe('Invalid product ID');
      expect(FEEDBACK_MESSAGES.INVALID_ORDER_ID).toBe('Invalid order ID');
      expect(FEEDBACK_MESSAGES.INVALID_FEEDBACK_ID).toBe('Invalid feedback ID');
      expect(FEEDBACK_MESSAGES.CREATE_FAILED).toBe('Failed to create feedback');
      expect(FEEDBACK_MESSAGES.UPDATE_FAILED).toBe('Failed to update feedback');
      expect(FEEDBACK_MESSAGES.DELETE_FAILED).toBe('Failed to delete feedback');
      expect(FEEDBACK_MESSAGES.FETCH_FAILED).toBe('Failed to fetch feedbacks');
    });
  });

  describe('validateCreateFeedback', () => {
    it('should return valid for correct feedback data', () => {
      const data = {
        productId: '507f1f77bcf86cd799439011',
        orderId: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'This is a great product! Really satisfied with my purchase.',
      };

      const result = validateCreateFeedback(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    describe('productId validation', () => {
      it('should return error for missing productId', () => {
        const data = {
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Product ID is required and must be a valid string');
      });

      it('should return error for non-string productId', () => {
        const data = {
          productId: 123,
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Product ID is required and must be a valid string');
      });
    });

    describe('orderId validation', () => {
      it('should return error for missing orderId', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          rating: 5,
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Order ID is required and must be a valid string');
      });

      it('should return error for non-string orderId', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: 123,
          rating: 5,
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Order ID is required and must be a valid string');
      });
    });

    describe('rating validation', () => {
      it('should return error for missing rating', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Rating is required and must be a number');
      });

      it('should return error for non-number rating', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: '5',
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Rating is required and must be a number');
      });

      it('should return error for rating less than 1', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: -1,
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Rating must be between 1 and 5');
      });

      it('should return error for rating greater than 5', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: 6,
          comment: 'Great product',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Rating must be between 1 and 5');
      });

      it('should accept ratings 1 through 5', () => {
        [1, 2, 3, 4, 5].forEach((rating) => {
          const data = {
            productId: '507f1f77bcf86cd799439011',
            orderId: '507f1f77bcf86cd799439012',
            rating,
            comment: 'Great product with sufficient length for validation',
          };

          const result = validateCreateFeedback(data);

          expect(result.isValid).toBe(true);
        });
      });
    });

    describe('comment validation', () => {
      it('should return error for missing comment', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Comment is required and must be a string');
      });

      it('should return error for non-string comment', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
          comment: 123,
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Comment is required and must be a string');
      });

      it('should return error for comment less than 10 characters', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
          comment: 'Short',
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Comment must be at least 10 characters long');
      });

      it('should return error for comment exceeding 1000 characters', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
          comment: 'a'.repeat(1001),
        };

        const result = validateCreateFeedback(data);

        expect(result.errors).toContain('Comment must not exceed 1000 characters');
      });

      it('should accept comment with exactly 10 characters', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
          comment: '1234567890',
        };

        const result = validateCreateFeedback(data);

        expect(result.isValid).toBe(true);
      });

      it('should accept comment with exactly 1000 characters', () => {
        const data = {
          productId: '507f1f77bcf86cd799439011',
          orderId: '507f1f77bcf86cd799439012',
          rating: 5,
          comment: 'a'.repeat(1000),
        };

        const result = validateCreateFeedback(data);

        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateUpdateFeedback', () => {
    it('should return valid for correct update data', () => {
      const data = {
        rating: 4,
        comment: 'Updated comment with more details',
      };

      const result = validateUpdateFeedback(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should allow updating only rating', () => {
      const data = {
        rating: 3,
      };

      const result = validateUpdateFeedback(data);

      expect(result.isValid).toBe(true);
    });

    it('should allow updating only comment', () => {
      const data = {
        comment: 'This is an updated comment with sufficient length',
      };

      const result = validateUpdateFeedback(data);

      expect(result.isValid).toBe(true);
    });

    it('should return error for invalid rating type', () => {
      const data = {
        rating: '3',
      };

      const result = validateUpdateFeedback(data);

      expect(result.errors).toContain('Rating must be a number');
    });

    it('should return error for rating out of range', () => {
      const data = {
        rating: 6,
      };

      const result = validateUpdateFeedback(data);

      expect(result.errors).toContain('Rating must be between 1 and 5');
    });

    it('should return error for non-string comment', () => {
      const data = {
        comment: 123,
      };

      const result = validateUpdateFeedback(data);

      expect(result.errors).toContain('Comment must be a string');
    });

    it('should return error for short comment', () => {
      const data = {
        comment: 'Short',
      };

      const result = validateUpdateFeedback(data);

      expect(result.errors).toContain('Comment must be at least 10 characters long');
    });

    it('should return error for long comment', () => {
      const data = {
        comment: 'a'.repeat(1001),
      };

      const result = validateUpdateFeedback(data);

      expect(result.errors).toContain('Comment must not exceed 1000 characters');
    });
  });

  describe('buildFeedbackFilter', () => {
    it('should return empty filter with no parameters', () => {
      const filter = buildFeedbackFilter({});

      expect(filter).toEqual({});
    });

    it('should add productId to filter', () => {
      const filter = buildFeedbackFilter({}, '507f1f77bcf86cd799439011');

      expect(filter.productId).toBe('507f1f77bcf86cd799439011');
    });

    it('should add customerId to filter', () => {
      const filter = buildFeedbackFilter({}, undefined, '507f1f77bcf86cd799439012');

      expect(filter.customerId).toBe('507f1f77bcf86cd799439012');
    });

    it('should add both productId and customerId to filter', () => {
      const filter = buildFeedbackFilter(
        {},
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012'
      );

      expect(filter.productId).toBe('507f1f77bcf86cd799439011');
      expect(filter.customerId).toBe('507f1f77bcf86cd799439012');
    });
  });

  describe('buildFeedbackSort', () => {
    it('should return default sort by createdAt descending', () => {
      const sort = buildFeedbackSort({});

      expect(sort).toEqual({ createdAt: -1 });
    });

    it('should sort by rating descending', () => {
      const sort = buildFeedbackSort({ sortBy: 'rating', sortOrder: 'desc' });

      expect(sort).toEqual({ rating: -1 });
    });

    it('should sort by rating ascending', () => {
      const sort = buildFeedbackSort({ sortBy: 'rating', sortOrder: 'asc' });

      expect(sort).toEqual({ rating: 1 });
    });

    it('should sort by createdAt ascending', () => {
      const sort = buildFeedbackSort({ sortBy: 'createdAt', sortOrder: 'asc' });

      expect(sort).toEqual({ createdAt: 1 });
    });

    it('should sort by updatedAt', () => {
      const sort = buildFeedbackSort({ sortBy: 'updatedAt', sortOrder: 'desc' });

      expect(sort).toEqual({ updatedAt: -1 });
    });

    it('should return default sort for invalid sortBy field', () => {
      const sort = buildFeedbackSort({ sortBy: 'invalidField', sortOrder: 'desc' });

      expect(sort).toEqual({ createdAt: -1 });
    });

    it('should default to descending order when sortOrder is not asc', () => {
      const sort = buildFeedbackSort({ sortBy: 'rating' });

      expect(sort).toEqual({ rating: -1 });
    });
  });
});
