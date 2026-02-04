import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['BAHAN_BAKU', 'GAJI', 'LISTRIK', 'AIR', 'SEWA', 'TRANSPORT', 'PERLENGKAPAN', 'MAINTENANCE', 'MARKETING', 'LAINNYA'] 
  })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop()
  note?: string;

  @Prop()
  receiptUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdByUserId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

// Compound index for efficient queries
ExpenseSchema.index({ companyId: 1, outletId: 1, date: -1 });
ExpenseSchema.index({ companyId: 1, date: -1 });
ExpenseSchema.index({ companyId: 1, category: 1, date: -1 });
