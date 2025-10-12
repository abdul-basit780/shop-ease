// lib/services/payment/PaymentFactory.ts
import { IPaymentStrategy } from "./IPaymentStrategy";
import { StripePaymentStrategy } from "./StripePaymentStrategy";
import { CashPaymentStrategy } from "./CashPaymentStrategy";
// import { PayPalPaymentStrategy } from "./PayPalPaymentStrategy";

/**
 * Factory for creating payment strategy instances
 * Follows the Factory Pattern and Open/Closed Principle
 */
export class PaymentFactory {
  private static strategies: Map<string, () => IPaymentStrategy> = new Map([
    ["stripe", () => new StripePaymentStrategy()],
    ["cash", () => new CashPaymentStrategy()],
    // To add PayPal, simply uncomment:
    // ["paypal", () => new PayPalPaymentStrategy()],

    // To add more payment methods in the future, just add here:
    // ["razorpay", () => new RazorpayPaymentStrategy()],
    // ["square", () => new SquarePaymentStrategy()],
    // ["venmo", () => new VenmoPaymentStrategy()],
  ]);

  /**
   * Get a payment strategy by name
   * @param method - Payment method name (stripe, cash, paypal, etc.)
   * @returns Payment strategy instance
   * @throws Error if payment method is not supported
   */
  static getStrategy(method: string): IPaymentStrategy {
    const strategyFactory = this.strategies.get(method.toLowerCase());

    if (!strategyFactory) {
      throw new Error(
        `Unsupported payment method: ${method}. Supported methods: ${this.getSupportedMethods().join(
          ", "
        )}`
      );
    }

    const strategy = strategyFactory();

    // Validate that the payment method is properly configured
    if (!strategy.isConfigured()) {
      throw new Error(
        `Payment method ${method} is not properly configured. Please check environment variables.`
      );
    }

    return strategy;
  }

  /**
   * Get list of supported payment methods
   */
  static getSupportedMethods(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Check if a payment method is supported
   */
  static isSupported(method: string): boolean {
    return this.strategies.has(method.toLowerCase());
  }

  /**
   * Register a new payment strategy (for plugins/extensions)
   * Allows third-party code to add new payment methods without modifying this file
   */
  static registerStrategy(
    name: string,
    strategyFactory: () => IPaymentStrategy
  ): void {
    if (this.strategies.has(name)) {
      console.warn(
        `Payment strategy '${name}' is already registered. Overwriting.`
      );
    }
    this.strategies.set(name.toLowerCase(), strategyFactory);
  }
}
