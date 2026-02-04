import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddonDocument = Addon & Document;

@Schema({ timestamps: true, versionKey: false })
export class Addon {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  outletId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const AddonSchema = SchemaFactory.createForClass(Addon);

// Indexes
AddonSchema.index({ companyId: 1 });
AddonSchema.index({ outletId: 1 });
