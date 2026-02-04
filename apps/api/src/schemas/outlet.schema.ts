import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { 
  RoundingMode, 
  OrderMode, 
  PaymentMethod,
  ITransferInstructions,
  IQrInstructions,
  IPaymentConfig,
  IOutletSettings 
} from '@orixa/shared';

export type OutletDocument = Outlet & Document;

@Schema({ timestamps: true, versionKey: false })
export class Outlet {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop({ default: 'Asia/Jakarta' })
  timezone: string;

  @Prop({ default: 'IDR' })
  currency: string;

  @Prop(raw({
    taxRate: { type: Number, default: 10 },
    serviceRate: { type: Number, default: 0 },
    rounding: { type: String, enum: RoundingMode, default: RoundingMode.NONE },
    orderMode: { type: String, enum: OrderMode, default: OrderMode.QR_AND_POS },
    paymentConfig: raw({
      enabledMethods: { type: [String], enum: PaymentMethod, default: [PaymentMethod.CASH] },
      transferInstructions: raw({
        bankName: { type: String },
        accountName: { type: String },
        accountNumberOrVA: { type: String },
        note: { type: String },
      }),
      qrInstructions: raw({
        qrImageUrl: { type: String },
        note: { type: String },
      }),
    }),
  }))
  settings: IOutletSettings;

  @Prop({ default: true })
  isActive: boolean;
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);

// Indexes
OutletSchema.index({ companyId: 1 });
OutletSchema.index({ companyId: 1, name: 1 });
