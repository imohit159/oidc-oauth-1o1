import { getBaseEmailWrapper } from "./base.template";

export function getEmailVerificationHtml(verificationUrl: string): string {
  const content = `
    <h2 class="title">Confirm Your Email Address</h2>
    <p class="text">
      Thank you for creating an account with Zen. To verify your email address 
      and complete your registration, please click the button below:
    </p>
    <div class="btn-container">
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    </div>
    <div class="security-note">
      <p class="security-text">
        <strong>Note:</strong> This verification link is valid for <strong>24 hours</strong>. 
        If you did not create this account, you can safely ignore this email.
      </p>
    </div>
    <div class="fallback-box">
      <p class="fallback-title">Direct Link</p>
      <a href="${verificationUrl}" class="fallback-url">${verificationUrl}</a>
    </div>
  `;
  return getBaseEmailWrapper("Verify Your Email Address", content);
}
