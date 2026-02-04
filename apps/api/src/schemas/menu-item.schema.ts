import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IMenuItemVariant } from '@orixa/shared';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true, versionKey: false })
export class MenuItem {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  outletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  imageUrl: string;

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isAvailable: boolean; // false = sold out / habis

  @Prop({ type: Number, default: null })
  stock: number | null; // null = unlimited, number = tracked stock

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop(raw([{
    name: { type: String, required: true },
    priceDelta: { type: Number, required: true },
  }]))
  variants: IMenuItemVariant[];

  @Prop({ type: [Types.ObjectId], ref: 'Addon', default: [] })
  addonIds: Types.ObjectId[];
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

// Indexes
MenuItemSchema.index({ companyId: 1 });
MenuItemSchema.index({ outletId: 1 });
MenuItemSchema.index({ categoryId: 1 });
MenuItemSchema.index({ outletId: 1, isActive: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });
