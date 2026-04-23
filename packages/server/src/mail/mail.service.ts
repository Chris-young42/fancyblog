import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            h1 { color: #1a1a2e; font-size: 20px; margin: 0 0 20px 0; text-align: center; }
            .code-box { background: linear-gradient(135deg, #6366f1, #22d3ee); border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
            .code { font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 8px; }
            .tip { color: #666; font-size: 14px; text-align: center; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BlogFancy</div>
            </div>
            <h1>密码重置验证码</h1>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p class="tip">验证码 5 分钟内有效，请勿告知他人</p>
            <div class="footer">
              如果您未请求此验证码，请忽略此邮件
            </div>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"BlogFancy" <${process.env.SMTP_USER || 'noreply@blogfancy.com'}>`,
      to: email,
      subject: 'BlogFancy 密码重置验证码',
      html,
    });
  }
}
