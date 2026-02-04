import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../schemas';
import { Company, CompanyDocument } from '../../schemas';
import { Outlet, OutletDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import {
  Role,
  CompanyPlan,
  ITokenPayload,
  IUserPublic,
  AuditAction,
  EntityType,
  PaymentMethod,
  RoundingMode,
  OrderMode,
} from '@orixa/shared';
import { RegisterCompanyDto, LoginDto, MemberRegisterDto, ForgotPasswordDto, ResetPasswordDto, ActivateAccountDto, ResendActivationDto, ChangePasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Outlet.name) private outletModel: Model<OutletDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private mailService: MailService,
  ) {}

  async registerCompany(dto: RegisterCompanyDto) {
    // Check if email exists
    const existingUser = await this.userModel.findOne({ email: dto.adminEmail.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if company slug exists
    const slug = this.generateSlug(dto.companyName);
    const existingCompany = await this.companyModel.findOne({ slug });
    if (existingCompany) {
      throw new ConflictException('Company name already taken');
    }

    // Create company
    const company = await this.companyModel.create({
      name: dto.companyName,
      slug,
      plan: CompanyPlan.FREE,
      isActive: true,
    });

    // Create default outlet
    const outlet = await this.outletModel.create({
      companyId: company._id,
      name: 'Outlet Utama',
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      settings: {
        taxRate: 10,
        serviceRate: 0,
        rounding: RoundingMode.NONE,
        orderMode: OrderMode.QR_AND_POS,
        paymentConfig: {
          enabledMethods: [PaymentMethod.CASH],
        },
      },
      isActive: true,
    });

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create admin user
    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);
    const user = await this.userModel.create({
      name: dto.adminName,
      email: dto.adminEmail.toLowerCase(),
      passwordHash,
      role: Role.COMPANY_ADMIN,
      companyId: company._id,
      outletIds: [outlet._id],
      isActive: true,
      isEmailVerified: false,
      activationToken,
      activationTokenExpires,
    });

    // Send activation email
    try {
      await this.mailService.sendActivationEmail(user.email, user.name, activationToken);
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send activation email:', error);
    }

    // Audit
    await this.auditService.log({
      actorUserId: user._id.toString(),
      companyId: company._id.toString(),
      action: AuditAction.CREATE,
      entityType: EntityType.COMPANY,
      entityId: company._id.toString(),
      detail: { companyName: company.name },
    });

    return {
      message: 'Company registered successfully. Please check your email to verify your account.',
      company: {
        _id: company._id,
        name: company.name,
        slug: company.slug,
      },
    };
  }

  async activateAccount(dto: ActivateAccountDto) {
    const user = await this.userModel.findOne({
      activationToken: dto.token,
      activationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired activation token');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      {
        isEmailVerified: true,
        activationToken: null,
        activationTokenExpires: null,
      },
    );

    // Get company name for welcome email
    const company = await this.companyModel.findById(user.companyId);
    if (company) {
      try {
        await this.mailService.sendWelcomeEmail(user.email, user.name, company.name);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    return { message: 'Account activated successfully. You can now login.' };
  }

  async resendActivation(dto: ResendActivationDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
      isEmailVerified: false,
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If your email is registered and not verified, you will receive an activation email.' };
    }

    // Generate new activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userModel.updateOne(
      { _id: user._id },
      { activationToken, activationTokenExpires },
    );

    try {
      await this.mailService.sendActivationEmail(user.email, user.name, activationToken);
    } catch (error) {
      console.error('Failed to send activation email:', error);
    }

    return { message: 'If your email is registered and not verified, you will receive an activation email.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If your email is registered, you will receive a password reset link.' };
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userModel.updateOne(
      { _id: user._id },
      { resetPasswordToken, resetPasswordTokenExpires },
    );

    try {
      await this.mailService.sendPasswordResetEmail(user.email, user.name, resetPasswordToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return { message: 'If your email is registered, you will receive a password reset link.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: dto.token,
      resetPasswordTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.userModel.updateOne(
      { _id: user._id },
      {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
        refreshToken: null, // Invalidate all sessions
      },
    );

    return { message: 'Password reset successfully. You can now login with your new password.' };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified (skip for super admin)
    if (!user.isEmailVerified && user.role !== Role.SUPER_ADMIN) {
      throw new UnauthorizedException('Silakan verifikasi email Anda terlebih dahulu. Cek inbox atau spam.');
    }

    const tokens = await this.generateTokens(user);

    // Save refresh token hash
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: refreshTokenHash },
    );

    // Audit
    await this.auditService.log({
      actorUserId: user._id.toString(),
      companyId: user.companyId?.toString(),
      action: AuditAction.LOGIN,
      entityType: EntityType.USER,
      entityId: user._id.toString(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserPublic(user),
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);

    // Update refresh token
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: refreshTokenHash },
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (user) {
      await this.userModel.updateOne(
        { _id: user._id },
        { refreshToken: null },
      );

      await this.auditService.log({
        actorUserId: user._id.toString(),
        companyId: user.companyId?.toString(),
        action: AuditAction.LOGOUT,
        entityType: EntityType.USER,
        entityId: user._id.toString(),
      });
    }

    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toUserPublic(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.updateOne(
      { _id: user._id },
      { passwordHash },
    );

    await this.auditService.log({
      actorUserId: user._id.toString(),
      companyId: user.companyId?.toString(),
      action: AuditAction.UPDATE,
      entityType: EntityType.USER,
      entityId: user._id.toString(),
      detail: { action: 'password_changed' },
    });

    return { message: 'Password changed successfully' };
  }

  // Member registration
  async memberRegister(dto: MemberRegisterDto) {
    const existingUser = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    let companyId = dto.companyId;

    // If qrToken provided, get companyId from table/outlet
    if (dto.qrToken && !companyId) {
      const { InjectModel } = require('@nestjs/mongoose');
      // We'll use the outlet directly for simplicity
      // In real scenario, resolve qrToken to outlet
    }

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: Role.CUSTOMER_MEMBER,
      companyId: companyId || null,
      phone: dto.phone,
      isActive: true,
      isEmailVerified: false,
      activationToken,
      activationTokenExpires,
    });

    // Send activation email
    try {
      await this.mailService.sendActivationEmail(user.email, user.name, activationToken);
    } catch (error) {
      console.error('Failed to send activation email:', error);
    }

    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserPublic(user),
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  private async generateTokens(user: UserDocument) {
    const payload: ITokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId?.toString(),
      outletIds: user.outletIds?.map((id) => id.toString()),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private toUserPublic(user: UserDocument): IUserPublic {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId?.toString(),
      outletIds: user.outletIds?.map((id) => id.toString()),
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
