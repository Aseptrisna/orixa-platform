import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../schemas';
import { AuditAction, EntityType } from '@orixa/shared';

interface LogParams {
  actorUserId?: string;
  companyId?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  detail?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(params: LogParams): Promise<void> {
    await this.auditLogModel.create({
      actorUserId: params.actorUserId ? new Types.ObjectId(params.actorUserId) : null,
      companyId: params.companyId ? new Types.ObjectId(params.companyId) : null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ? new Types.ObjectId(params.entityId) : null,
      detail: params.detail,
    });
  }

  async findAll(companyId?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const query: any = {};
    
    if (companyId) {
      query.companyId = new Types.ObjectId(companyId);
    }

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .populate('actorUserId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.auditLogModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
