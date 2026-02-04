import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuditAction, EntityType } from '@orixa/shared';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, versionKey: false })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  actorUserId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  companyId: Types.ObjectId | null;

  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @Prop({ required: true, enum: EntityType })
  entityType: EntityType;

  @Prop({ type: Types.ObjectId, default: null })
  entityId: Types.ObjectId | null;

  @Prop({ type: Object })
  detail: Record<string, unknown>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ companyId: 1 });
AuditLogSchema.index({ actorUserId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ createdAt: -1 });
