import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { Role, AuditAction, EntityType, IUserPublic } from '@orixa/shared';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto, companyId: string, actorUserId: string): Promise<IUserPublic> {
    // Check email uniqueness
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Only CASHIER can be created by COMPANY_ADMIN
    if (dto.role !== Role.CASHIER) {
      throw new ForbiddenException('Can only create CASHIER users');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      companyId: new Types.ObjectId(companyId),
      outletIds: dto.outletIds?.map((id) => new Types.ObjectId(id)) || [],
      phone: dto.phone,
      isActive: true,
      isEmailVerified:true
    });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.CREATE,
      entityType: EntityType.USER,
      entityId: user._id.toString(),
      detail: { name: user.name, role: user.role },
    });

    return this.toPublic(user);
  }

  async findAll(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find({
          companyId: new Types.ObjectId(companyId),
          role: { $in: [Role.COMPANY_ADMIN, Role.CASHIER] },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments({
        companyId: new Types.ObjectId(companyId),
        role: { $in: [Role.COMPANY_ADMIN, Role.CASHIER] },
      }),
    ]);

    return {
      data: data.map((u) => this.toPublic(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, companyId: string): Promise<IUserPublic> {
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublic(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    companyId: string,
    actorUserId: string,
  ): Promise<IUserPublic> {
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
      user.email = dto.email.toLowerCase();
    }

    if (dto.name) user.name = dto.name;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.outletIds) {
      user.outletIds = dto.outletIds.map((id) => new Types.ObjectId(id));
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await user.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.UPDATE,
      entityType: EntityType.USER,
      entityId: user._id.toString(),
    });

    return this.toPublic(user);
  }

  async delete(id: string, companyId: string, actorUserId: string): Promise<void> {
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cannot delete self
    if (user._id.toString() === actorUserId) {
      throw new ForbiddenException('Cannot delete yourself');
    }

    await this.userModel.deleteOne({ _id: user._id });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.DELETE,
      entityType: EntityType.USER,
      entityId: id,
    });
  }

  private toPublic(user: UserDocument): IUserPublic {
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
}
