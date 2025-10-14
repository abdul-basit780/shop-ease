// lib/services/payment/CashPaymentStrategy.ts
import {
  IPaymentStrategy,
  PaymentResult,
  RefundResult,
} from "./IPaymentStrategy";

export class CashPaymentStrategy implements IPaymentStrategy {
  getName(): string {
    return "cash";
  }

  async createPayment(
    amount: number,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    // Cash payment doesn't require any external processing
    // Payment will be collected on delivery
    return {
      success: true,
      status: "pending",
      // No paymentId or clientSecret for cash payments
    };
  }

  async processRefund(
    paymentId: string,
    amount: number,
    metadata: Record<string, any>
  ): Promise<RefundResult> {
    // Cash refunds are handled manually offline
    // Just return success to mark the payment as cancelled
    return {
      success: true,
      amount: amount,
      status: "manual_refund_required",
      // No refundId for cash payments
    };
  }

  supportsRefund(): boolean {
    // Cash payments can be "refunded" but it's a manual process
    return true;
  }

  isConfigured(): boolean {
    // Cash payment doesn't require any configuration
    return true;
  }
}
