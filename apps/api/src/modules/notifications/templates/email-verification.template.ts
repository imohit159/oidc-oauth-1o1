export function getEmailVerificationHtml(verificationUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h1 style="color: #333;">Verify Your Email Address</h1>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </p>
      <p>If you cannot click the button, copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p style="font-size: 0.9em; color: #777;">This link will expire in 24 hours. If you did not request this, please ignore this email.</p>
    </div>
  `;
}
