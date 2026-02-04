import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '@orixa/shared';

export type UserDocument = User & Document;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  companyId: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: 'Outlet', default: [] })
  outletIds: Types.ObjectId[];

  @Prop()
  phone: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken: string;

  // Email verification
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  activationToken: string;

  @Prop()
  activationTokenExpires: Date;

  // Password reset
  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordTokenExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ companyId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ activationToken: 1 });
UserSchema.index({ resetPasswordToken: 1 });
