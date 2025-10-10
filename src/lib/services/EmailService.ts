// lib/services/EmailService.ts
import nodemailer from "nodemailer";
import { emailTemplates } from "../templates/emailTemplates";
import { OrderStatus } from "../models/enums";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
  requireTLS?: boolean;
  tls?: {
    ciphers?: string;
    rejectUnauthorized?: boolean;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderData {
  customerName: string;
  orderId: string;
  status: OrderStatus;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const port = parseInt(process.env.SMTP_PORT || "587");
    const host = process.env.SMTP_HOST || "smtp.gmail.com";

    // Determine secure setting based on port
    const secure = port === 465;

    const config: EmailConfig = {
      host,
      port,
      secure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    };

    // Add additional configuration for better compatibility
    if (port === 587) {
      config.requireTLS = true;
      config.tls = {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      };
    }

    // For development/testing environments, you might need to be less strict
    if (process.env.NODE_ENV === "development") {
      config.tls = {
        rejectUnauthorized: false,
      };
    }

    this.fromEmail = process.env.FROM_EMAIL || "noreply@shopease.com";
    this.fromName = process.env.FROM_NAME || "ShopEase";
    this.transporter = nodemailer.createTransport(config);
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        ...options,
      });
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);

      // Log additional debugging information
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          // @ts-ignore
          code: error.code,
          // @ts-ignore
          command: error.command,
        });
      }

      return false;
    }
  }

  async sendCustomerWelcome(data: {
    name: string;
    email: string;
    loginUrl: string;
  }): Promise<boolean> {
    const template = emailTemplates.customerWelcome(data);
    return this.sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendOrderConfirmation(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.orderConfirmation(data);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendAdminOrderConfirmation(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.adminOrderConfirmation(data);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }


  async sendOrderCancellation(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.orderCancellation(data);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendEmailVerification(
    email: string,
    data: {
      name: string;
      verificationUrl: string;
      expiresIn: string;
    }
  ): Promise<boolean> {
    const template = emailTemplates.emailVerification(data);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendPasswordReset(
    email: string,
    data: {
      name: string;
      resetUrl: string;
      expiresIn: string;
    }
  ): Promise<boolean> {
    const template = emailTemplates.passwordReset(data);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }


  async sendOrderStatusUpdate(
    email: string,
    data: OrderData
  ): Promise<boolean> {
    const template = emailTemplates.orderStatusUpdate(data);

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email service connected successfully");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);

      // Provide more specific error information
      if (error instanceof Error) {
        console.error("Connection test details:", {
          message: error.message,
          // @ts-ignore
          code: error.code,
          // @ts-ignore
          command: error.command,
        });
      }

      return false;
    }
  }
}

export const emailService = new EmailService();
