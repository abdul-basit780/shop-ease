// lib/services/EmailService.ts
import nodemailer from "nodemailer";
import { emailTemplates } from "../templates/emailTemplates";
import { OrderStatus } from "../models/enums";
// import { Resend } from "resend";

export interface OrderData {
  customerName: string;
  orderId: string;
  status: OrderStatus;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  // private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    // Simple configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });

    // const apiKey = process.env.RESEND_API_KEY || "";

    // if (!apiKey) {
    //   console.warn("⚠️  RESEND_API_KEY not found in environment variables");
    // }

    // this.resend = new Resend(apiKey);

    this.fromEmail = process.env.FROM_EMAIL || "noreply@shopease.com";
    this.fromName = process.env.FROM_NAME || "ShopEase";
  }

  // Private method to send email
  private async send(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      // const { data, error } = await this.resend.emails.send({
      //   from: `${this.fromName} <${this.fromEmail}>`,
      //   to: [to],
      //   subject,
      //   html,
      //   text,
      // });

      // if (error) {
      //   console.error("Resend API error:", error);
      //   return false;
      // }

      return true;
    } catch (error) {
      console.error("Email send failed:", error);
      return false;
    }
  }

  // Welcome email
  async sendCustomerWelcome(data: {
    name: string;
    email: string;
    loginUrl: string;
  }): Promise<boolean> {
    const template = emailTemplates.customerWelcome(data);
    return this.send(
      data.email,
      template.subject,
      template.html,
      template.text
    );
  }

  // Order confirmation
  async sendOrderConfirmation(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.orderConfirmation(data);
    return this.send(email, template.subject, template.html, template.text);
  }

  // Admin order notification
  async sendAdminOrderConfirmation(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.adminOrderConfirmation(data);
    return this.send(email, template.subject, template.html, template.text);
  }

  // Order cancellation
  async sendOrderCancellation(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.orderCancellation(data);
    return this.send(email, template.subject, template.html, template.text);
  }

  // Email verification
  async sendEmailVerification(
    email: string,
    data: { name: string; verificationUrl: string; expiresIn: string }
  ): Promise<boolean> {
    const template = emailTemplates.emailVerification(data);
    return this.send(email, template.subject, template.html, template.text);
  }

  // Password reset
  async sendPasswordReset(
    email: string,
    data: { name: string; resetUrl: string; expiresIn: string }
  ): Promise<boolean> {
    const template = emailTemplates.passwordReset(data);
    return this.send(email, template.subject, template.html, template.text);
  }

  // Order status update
  async sendOrderStatusUpdate(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.orderStatusUpdate(data);
    return this.send(email, template.subject, template.html, template.text);
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("✅ Email service connected");
      // const testEmail = process.env.TEST_EMAIL || this.fromEmail;
      // const { error } = await this.resend.emails.send({
      //   from: `${this.fromName} <${this.fromEmail}>`,
      //   to: [testEmail],
      //   subject: "Resend Connection Test",
      //   html: "<p>This is a test email to verify Resend integration.</p>",
      // });

      // if (error) {
      //   console.error("❌ Resend connection failed:", error);
      //   return false;
      // }

      // console.log("✅ Resend connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email service failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
