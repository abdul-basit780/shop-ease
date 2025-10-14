// lib/services/payment/IPaymentStrategy.ts

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  status: "pending" | "completed" | "failed";
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  status: string;
  error?: string;
}

export interface IPaymentStrategy {
  /**
   * Get the payment method name
   */
  getName(): string;

  /**
   * Create a payment
   * @param amount - Amount to charge (in dollars)
   * @param metadata - Additional metadata for the payment
   * @returns Payment result including payment ID and client secret if applicable
   */
  createPayment(
    amount: number,
    metadata: Record<string, any>
  ): Promise<PaymentResult>;

  /**
   * Process refund for a payment
   * @param paymentId - Original payment ID
   * @param amount - Amount to refund (in dollars)
   * @param metadata - Additional metadata for the refund
   * @returns Refund result including refund ID
   */
  processRefund(
    paymentId: string,
    amount: number,
    metadata: Record<string, any>
  ): Promise<RefundResult>;

  /**
   * Check if this payment method supports refunds
   */
  supportsRefund(): boolean;

  /**
   * Validate payment configuration
   */
  isConfigured(): boolean;
}
