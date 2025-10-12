// lib/templates/emailTemplates.ts
import { OrderStatus } from "../models/enums";
import { OrderData } from "../services/EmailService";

// Simple email wrapper
const wrap = (title: string, content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 40px auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header"><h1>${title}</h1></div>
  <div class="content">${content}</div>
  <div class="footer"><p>This is an automated email. Please do not reply.</p></div>
</body>
</html>
`;

export const emailTemplates = {
  // Welcome email
  customerWelcome: (data: {
    name: string;
    email: string;
    loginUrl: string;
  }) => ({
    subject: "Welcome to ShopEase",
    html: wrap(
      "Welcome to ShopEase",
      `
      <h2>Hello ${data.name}!</h2>
      <p>Thank you for registering with ShopEase. Your account has been successfully created.</p>
      
      <div class="box">
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Registered:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <a href="${data.loginUrl}" class="button">Login Now</a>
    `
    ),
    text: `Welcome ${data.name}! Login at: ${data.loginUrl}`,
  }),

  // Order confirmation
  orderConfirmation: (data: OrderData) => ({
    subject: `Order Confirmed #${data.orderId}`,
    html: wrap(
      "Order Confirmed",
      `
      <h2>Hello ${data.customerName}!</h2>
      <p>Your order has been successfully placed.</p>
      
      <div class="box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Status:</strong> ${data.status}</p>
      </div>

      <p>We'll send you updates as your order progresses.</p>
    `
    ),
    text: `Order #${data.orderId} confirmed`,
  }),

  // Admin order notification
  adminOrderConfirmation: (data: OrderData) => ({
    subject: `New Order #${data.orderId}`,
    html: wrap(
      "New Order Received",
      `
      <h2>New Order Alert</h2>
      <p>A new order has been placed by ${data.customerName}.</p>
      
      <div class="box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Status:</strong> ${data.status}</p>
      </div>
    `
    ),
    text: `New order #${data.orderId} from ${data.customerName}`,
  }),

  // Order cancellation
  orderCancellation: (data: OrderData, refundAmount?: number) => ({
    subject: `Order Cancelled #${data.orderId}`,
    html: wrap(
      "Order Cancelled",
      `
      <h2>Hello ${data.customerName}!</h2>
      <p>Your order has been cancelled.</p>
      
      <div class="box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        ${
          refundAmount ? `<p><strong>Refund:</strong> $${refundAmount}</p>` : ""
        }
      </div>

      ${
        refundAmount
          ? "<p>Your refund will be processed within 3-5 business days.</p>"
          : ""
      }
    `
    ),
    text: `Order #${data.orderId} cancelled. ${
      refundAmount ? `Refund: $${refundAmount}` : ""
    }`,
  }),

  // Email verification
  emailVerification: (data: {
    name: string;
    verificationUrl: string;
    expiresIn: string;
  }) => ({
    subject: "Verify Your Email",
    html: wrap(
      "Verify Your Email",
      `
      <h2>Hello ${data.name}!</h2>
      <p>Please verify your email address to activate your account.</p>
      
      <a href="${data.verificationUrl}" class="button">Verify Email</a>
      
      <p><strong>Link expires in ${data.expiresIn}</strong></p>
      
      <div class="box">
        <p>If the button doesn't work, copy this link:</p>
        <p>${data.verificationUrl}</p>
      </div>
    `
    ),
    text: `Verify email: ${data.verificationUrl} (expires in ${data.expiresIn})`,
  }),

  // Password reset
  passwordReset: (data: {
    name: string;
    resetUrl: string;
    expiresIn: string;
  }) => ({
    subject: "Reset Your Password",
    html: wrap(
      "Password Reset",
      `
      <h2>Hello ${data.name}!</h2>
      <p>We received a request to reset your password.</p>
      
      <a href="${data.resetUrl}" class="button">Reset Password</a>
      
      <p><strong>Link expires in ${data.expiresIn}</strong></p>
      
      <div class="box">
        <p>⚠️ If you didn't request this, ignore this email.</p>
        <p>If the button doesn't work, copy this link:</p>
        <p>${data.resetUrl}</p>
      </div>
    `
    ),
    text: `Reset password: ${data.resetUrl} (expires in ${data.expiresIn})`,
  }),

  // Order status update
  orderStatusUpdate: (data: OrderData) => ({
    subject: `Order Update #${data.orderId}`,
    html: wrap(
      "Order Update",
      `
      <h2>Hello ${data.customerName}!</h2>
      <p>Your order status has been updated.</p>
      
      <div class="box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>New Status:</strong> ${data.status}</p>
      </div>

      ${
        data.status === OrderStatus.COMPLETED
          ? "<p>✅ Order completed! Thank you for your purchase.</p>"
          : ""
      }
      ${
        data.status === OrderStatus.SHIPPED
          ? "<p>📦 Your order is on the way!</p>"
          : ""
      }
    `
    ),
    text: `Order #${data.orderId} updated to: ${data.status}`,
  }),
};
