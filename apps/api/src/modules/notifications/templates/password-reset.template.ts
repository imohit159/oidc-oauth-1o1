import { getBaseEmailWrapper } from "./base.template";

export function getPasswordResetHtml(resetUrl: string): string {
  const content = `
    <h2 class="title">Reset Your Password</h2>
    <p class="text">
      We received a request to reset the password associated with your account. 
      To complete the reset process, click the button below:
    </p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div class="security-note">
      <p class="security-text">
        <strong>Important:</strong> This password reset link is valid for <strong>1 hour</strong>. 
        If you did not request this change, you can safely ignore this email and your password will remain unchanged.
      </p>
    </div>
    <div class="fallback-box">
      <p class="fallback-title">Direct Link</p>
      <a href="${resetUrl}" class="fallback-url">${resetUrl}</a>
    </div>
  `;
  return getBaseEmailWrapper("Reset Your Password", content);
}
