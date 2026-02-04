import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  OrderStatus,
  PaymentStatus,
  OrderChannel,
  CustomerType,
  IOrderCustomer,
  IOrderItem,
  IOrderItemVariantSnapshot,
  IOrderItemAddonSnapshot,
} from '@orixa/shared';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, versionKey: false })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  outletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Table', default: null })
  tableId: Types.ObjectId | null;

  @Prop()
  sessionId: string;

  @Prop({ required: true, enum: OrderChannel })
  channel: OrderChannel;

  @Prop(raw({
    type: { type: String, enum: CustomerType, required: true },
    memberUserId: { type: Types.ObjectId, ref: 'User', default: null },
    name: { type: String },
    phone: { type: String },
  }))
  customer: IOrderCustomer;

  @Prop({ required: true, unique: true })
  orderCode: string;

  @Prop(raw([{
    menuItemId: { type: Types.ObjectId, ref: 'MenuItem', required: true },
    nameSnapshot: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    basePriceSnapshot: { type: Number, required: true },
    variantSnapshot: raw({
      name: { type: String },
      priceDelta: { type: Number },
    }),
    addonsSnapshot: [raw({
      addonId: { type: Types.ObjectId },
      name: { type: String },
      price: { type: Number },
    })],
    note: { type: String },
    lineTotal: { type: Number, required: true },
  }]))
  items: IOrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ default: 0, min: 0 })
  service: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdByUserId: Types.ObjectId | null;

  @Prop()
  note: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ companyId: 1 });
OrderSchema.index({ outletId: 1 });
OrderSchema.index({ orderCode: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ outletId: 1, status: 1 });
OrderSchema.index({ outletId: 1, createdAt: -1 });
OrderSchema.index({ 'customer.memberUserId': 1 });
