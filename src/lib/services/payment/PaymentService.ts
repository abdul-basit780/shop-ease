// lib/services/payment/PaymentService.ts
import { PaymentFactory } from "./PaymentFactory";
import {
  IPaymentStrategy,
  PaymentResult,
  RefundResult,
} from "./IPaymentStrategy";

/**
 * Payment Service - High-level API for payment operations
 * Uses Strategy Pattern via PaymentFactory
 */
export class PaymentService {
  /**
   * Create a payment using the specified method
   */
  static async createPayment(
    method: string,
    amount: number,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    try {
      const strategy = PaymentFactory.getStrategy(method);
      return await strategy.createPayment(amount, metadata);
    } catch (error: any) {
      console.error(`Payment creation error (${method}):`, error);
      return {
        success: false,
        status: "failed",
        error: error.message || "Payment creation failed",
      };
    }
  }

  /**
   * Process a refund using the original payment method
   */
  static async processRefund(
    method: string,
    paymentId: string,
    amount: number,
    metadata: Record<string, any>
  ): Promise<RefundResult> {
    try {
      const strategy = PaymentFactory.getStrategy(method);

      if (!strategy.supportsRefund()) {
        return {
          success: false,
          amount: amount,
          status: "not_supported",
          error: `Refunds are not supported for ${method} payments`,
        };
      }

      return await strategy.processRefund(paymentId, amount, metadata);
    } catch (error: any) {
      console.error(`Refund processing error (${method}):`, error);
      return {
        success: false,
        amount: amount,
        status: "failed",
        error: error.message || "Refund processing failed",
      };
    }
  }

  /**
   * Check if a payment method is supported and configured
   */
  static isAvailable(method: string): boolean {
    try {
      if (!PaymentFactory.isSupported(method)) {
        return false;
      }
      const strategy = PaymentFactory.getStrategy(method);
      return strategy.isConfigured();
    } catch {
      return false;
    }
  }

  /**
   * Get all available payment methods (supported and configured)
   */
  static getAvailableMethods(): string[] {
    return PaymentFactory.getSupportedMethods().filter((method) =>
      this.isAvailable(method)
    );
  }

  /**
   * Get payment method details
   */
  static getMethodDetails(method: string): {
    name: string;
    supportsRefund: boolean;
    isConfigured: boolean;
  } | null {
    try {
      const strategy = PaymentFactory.getStrategy(method);
      return {
        name: strategy.getName(),
        supportsRefund: strategy.supportsRefund(),
        isConfigured: strategy.isConfigured(),
      };
    } catch {
      return null;
    }
  }
}

// Export for convenience
export { PaymentFactory } from "./PaymentFactory";
