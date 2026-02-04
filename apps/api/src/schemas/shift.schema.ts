import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShiftDocument = Shift & Document;

@Schema({ timestamps: true, versionKey: false })
export class Shift {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  outletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  cashierUserId: Types.ObjectId;

  @Prop({ required: true })
  openedAt: Date;

  @Prop()
  closedAt: Date;

  @Prop({ required: true, min: 0 })
  openingCash: number;

  @Prop({ min: 0 })
  closingCash: number;

  @Prop()
  note: string;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);

// Indexes
ShiftSchema.index({ companyId: 1 });
ShiftSchema.index({ outletId: 1 });
ShiftSchema.index({ cashierUserId: 1 });
ShiftSchema.index({ outletId: 1, openedAt: -1 });
