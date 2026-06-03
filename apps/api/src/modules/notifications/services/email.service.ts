import { logger } from "../../../shared/logger/logger";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
    const html = `
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await EmailService.sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html,
    });
  }

  static async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const html = `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await EmailService.sendEmail({
      to: email,
      subject: "Reset Your Password",
      html,
    });
  }

  private static async sendEmail(options: EmailOptions): Promise<void> {
    // TODO: Integrate with actual email provider (Resend, SendGrid, etc.)
    // For now, log the email that would be sent
    logger.info("Email sent (stub)", {
      to: options.to,
      subject: options.subject,
    });

    // In production, replace with actual email sending logic:
    // await resend.emails.send({
    //   from: env.EMAIL_FROM,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    // });
  }
}
