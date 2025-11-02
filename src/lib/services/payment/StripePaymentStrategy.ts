// lib/services/payment/StripePaymentStrategy.ts
import Stripe from "stripe";
import {
  IPaymentStrategy,
  PaymentResult,
  RefundResult,
} from "./IPaymentStrategy";

export class StripePaymentStrategy implements IPaymentStrategy {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  getName(): string {
    return "stripe";
  }

  async createPayment(
    amount: number,
    metadata: Record<string, any>
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          ...metadata,
          // Ensure all metadata values are strings
          orderId: metadata.orderId?.toString() || "",
          customerId: metadata.customerId?.toString() || "",
        },
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        status: "pending",
      };
    } catch (error: any) {
      console.error("Stripe payment creation error:", error);
      return {
        success: false,
        status: "failed",
        error: error.message || "Failed to create Stripe payment",
      };
    }
  }

  async processRefund(
    paymentId: string,
    amount: number,
    metadata: Record<string, any>
  ): Promise<RefundResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: "requested_by_customer",
        metadata: {
          ...metadata,
          orderId: metadata.orderId?.toString() || "",
        },
      });

      return {
        success: true,
        refundId: refund.id,
        amount: amount,
        status: refund.status || "failed",
      };
    } catch (error: any) {
      console.error("Stripe refund error:", error);
      return {
        success: false,
        amount: amount,
        status: "failed",
        error: error.message || "Failed to process Stripe refund",
      };
    }
  }

  supportsRefund(): boolean {
    return true;
  }

  isConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  /**
   * Verify and get the current status of a payment intent
   */
  async verifyPaymentStatus(paymentIntentId: string): Promise<{
    success: boolean;
    status: string;
    error?: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      // Map Stripe status to our payment status
      let status = "pending";
      if (paymentIntent.status === "succeeded") {
        status = "completed";
      } else if (
        paymentIntent.status === "canceled"
      ) {
        status = "failed";
      }

      return {
        success: true,
        status,
      };
    } catch (error: any) {
      console.error("Stripe payment verification error:", error);
      return {
        success: false,
        status: "pending",
        error: error.message || "Failed to verify payment status",
      };
    }
  }
}
