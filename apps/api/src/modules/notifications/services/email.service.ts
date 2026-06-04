import { Resend } from "resend";

import { env } from "../../../config/env";
import { logger } from "../../../shared/logger/logger";
import { getEmailVerificationHtml, getPasswordResetHtml } from "../templates";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static resend: Resend | null = env.RESEND_API_KEY
    ? new Resend(env.RESEND_API_KEY)
    : null;

  static async sendVerificationEmail(
    email: string,
    verificationUrl: string,
  ): Promise<void> {
    const html = getEmailVerificationHtml(verificationUrl);

    await EmailService.sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html,
    });
  }

  static async sendPasswordResetEmail(
    email: string,
    resetUrl: string,
  ): Promise<void> {
    const html = getPasswordResetHtml(resetUrl);

    await EmailService.sendEmail({
      to: email,
      subject: "Reset Your Password",
      html,
    });
  }

  private static async sendEmail(options: EmailOptions): Promise<void> {
    if (!EmailService.resend || !env.EMAIL_FROM) {
      logger.warn(
        "Email sending is disabled because RESEND_API_KEY or EMAIL_FROM is not set.",
      );
      if (env.NODE_ENV !== "production") {
        logger.info("Email that would be sent in development:", {
          to: options.to,
          subject: options.subject,
          html: options.html,
        });
      }
      return;
    }

    try {
      await EmailService.resend.emails.send({
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      logger.info(
        `Email sent to ${options.to} with subject "${options.subject}"`,
      );
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}`, { error });
      // We don't re-throw the error to not interrupt the main flow (e.g., user registration)
      // The error is logged for observability.
    }
  }
}
