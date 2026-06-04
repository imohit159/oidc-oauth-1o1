export function getPasswordResetHtml(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h1 style="color: #333;">Password Reset Request</h1>
      <p>You are receiving this email because a password reset request was made for your account. Please click the link below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </p>
      <p>If you cannot click the button, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="font-size: 0.9em; color: #777;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;
}
