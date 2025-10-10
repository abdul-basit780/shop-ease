// lib/templates/emailTemplates.ts

import { OrderStatus } from "../models/enums";
import { OrderData } from "../services/EmailService";

// Base email template wrapper
const baseTemplate = (title: string, content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .info-box { background-color: white; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .warning-box { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  // Customer welcome email
  customerWelcome: (data: { name: string; email: string; loginUrl: string }) => ({
    subject: 'Welcome to ShopEase',
    html: baseTemplate('Welcome to ShopEase', `
      <h2>Hello ${data.name}!</h2>
      <p>Thank you for registering with ShopEase. Your account has been successfully created.</p>
      
      <div class="info-box">
        <p><strong>Your account:</strong> ${data.email}</p>
        <p><strong>Registration:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <p>You can now place orders, manage your profile, and view your orders history.</p>
      
      <a href="${data.loginUrl}" class="button">Login to Your Account</a>
    `),
    text: `Welcome ${data.name}! Your account has been created. Login at: ${data.loginUrl}`
  }),

  // Order confirmation
  orderConfirmation: (data: OrderData) => ({
    subject: `Order Confirmed - ${data.customerName} on ${data.orderId}`,
    html: baseTemplate('✅ Order Confirmed', `
      <h2>Hello ${data.customerName}!</h2>
      <p>Your order has been successfully placed.</p>
      
      <div class="info-box">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
      </div>
    `),
    text: `Order confirmed`
  }),

  adminOrderConfirmation: (data: OrderData) => ({
    subject: `Order Confirmed - ${data.customerName} on ${data.orderId}`,
    html: baseTemplate('✅ Order Confirmed', `
      <h2>Hello ${data.customerName}!</h2>
      <p>An order has been successfully placed.</p>

      <div class="info-box">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
      </div>
    `),
    text: `Order confirmed`
  }),

  // Order cancellation
  orderCancellation: (data: OrderData, refundAmount?: number) => ({
    subject: `Order Cancelled - ShopEase`,
    html: baseTemplate('❌ Order Cancelled', `
      <h2>Hello ${data.customerName}!</h2>
      <p>Your order has been cancelled as requested.</p>
      
      <div class="info-box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
      </div>

      ${refundAmount ? `
      <div class="warning-box">
        <h3>💰 Refund Information</h3>
        <p>$${refundAmount} will be refunded to your original payment method within 3-5 business days.</p>
      </div>
      ` : ''}

      <p>You can place a new order anytime through our platform.</p>
    `),
    text: `Order cancelled. ${refundAmount ? `Refund: $${refundAmount}` : ''}`
  }),

  // Email verification
  emailVerification: (data: { name: string; verificationUrl: string; expiresIn: string }) => ({
    subject: 'Please Verify Your Email Address',
    html: baseTemplate('📧 Verify Your Email', `
      <h2>Hello ${data.name}!</h2>
      <p>Thank you for registering! Please verify your email address to complete your account setup.</p>
      
      <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
      
      <p><strong>This link expires in ${data.expiresIn}.</strong></p>

      <div class="warning-box">
        <h3>⚠️ Important</h3>
        <p>You must verify your email to place orders and access all features.</p>
      </div>

      <p>If the button doesn't work, copy this link: ${data.verificationUrl}</p>
    `),
    text: `Please verify your email address: ${data.verificationUrl} (expires in ${data.expiresIn})`
  }),
  passwordReset: (data: { name: string; resetUrl: string; expiresIn: string }) => ({
    subject: 'Password Reset Request - Action Required',
    html: baseTemplate('🔒 Password Reset Request', `
      <h2>Hello ${data.name}!</h2>
      <p>We received a request to reset your password.</p>
      
      <a href="${data.resetUrl}" class="button">Reset Password</a>
      
      <p><strong>This link expires in ${data.expiresIn}.</strong></p>

      <div class="warning-box">
        <h3>🛡️ Security Notice</h3>
        <p>If you didn't request this, ignore this email. The link can only be used once.</p>
      </div>

      <p>If the button doesn't work, copy this link: ${data.resetUrl}</p>
    `),
    text: `Password reset requested. Visit: ${data.resetUrl} (expires in ${data.expiresIn})`
  }),

  // Order status update
  orderStatusUpdate: (data: OrderData) => ({
    subject: `Order Update - ShopEase`,
    html: baseTemplate('📋 Order Update', `
      <h2>Hello ${data.customerName}!</h2>
      <p>Your order status has been updated.</p>
      
      <div class="info-box">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Status:</strong> ${data.status}</p>
      </div>

      ${data.status === OrderStatus.COMPLETED ? '<p>Thank you for your visit! You can now provide feedback.</p>' : ''}
    `),
    text: `Order with ID ${data.orderId} updated to: ${data.status}`
  })
};