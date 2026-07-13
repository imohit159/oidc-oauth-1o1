export function getBaseEmailWrapper(
  title: string,
  contentHtml: string,
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }
    .header {
      padding: 32px 32px 16px 32px;
      border-bottom: 1px solid #f1f5f9;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.05em;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    .logo-dot {
      color: #6366f1;
    }
    .content {
      padding: 32px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    .text {
      font-size: 15px;
      line-height: 24px;
      color: #475569;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      background-color: #0f172a;
      color: #ffffff !important;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
    }
    .fallback-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      word-break: break-all;
    }
    .fallback-title {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      margin-top: 0;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .fallback-url {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      color: #6366f1;
      text-decoration: none;
      line-height: 18px;
    }
    .footer {
      padding: 32px;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      line-height: 18px;
      color: #94a3b8;
      margin: 0;
    }
    .security-note {
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 24px;
      margin-bottom: 0px;
    }
    .security-text {
      font-size: 13px;
      line-height: 18px;
      color: #b45309;
      margin: 0;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="logo">Zen<span class="logo-dot">.</span></span>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${new Date().getFullYear()} Zen Security. All rights reserved.</p>
      <p class="footer-text" style="margin-top: 4px;">This is a transactional security notification relating to your credentials.</p>
    </div>
  </div>
</body>
</html>`;
}
