import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get('MAIL_FROM_EMAIL', 'noreply@orixa.dev');
    this.fromName = this.configService.get('MAIL_FROM_NAME', 'ORIXA Platform');
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');

    // Create reusable transporter using Gmail SMTP
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get('MAIL_PORT', '587')),
      secure: this.configService.get('MAIL_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendActivationEmail(email: string, name: string, token: string): Promise<void> {
    const activationUrl = `${this.frontendUrl}/activate?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ORIXA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with ORIXA. Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy this link to your browser:<br>
            <a href="${activationUrl}" style="color: #667eea;">${activationUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #333;">
          <p style="color: #999; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ORIXA Platform</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Verify Your ORIXA Account',
        html,
      });
      this.logger.log(`Activation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send activation email to ${email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ORIXA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy this link to your browser:<br>
            <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #333;">
          <p style="color: #999; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ORIXA Platform</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Reset Your ORIXA Password',
        html,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string, companyName: string): Promise<void> {
    const loginUrl = `${this.frontendUrl}/login`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ORIXA</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome to ORIXA, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your company <strong>${companyName}</strong> has been successfully registered on ORIXA Platform.
          </p>
          <p style="color: #666; line-height: 1.6;">
            You can now start setting up your business:
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Configure your outlets and payment methods</li>
            <li>Add your menu items and categories</li>
            <li>Set up tables with QR codes</li>
            <li>Invite your staff members</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #333;">
          <p style="color: #999; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ORIXA Platform</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Welcome to ORIXA Platform!',
        html,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Don't throw - welcome email is not critical
    }
  }
}
