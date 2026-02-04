import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CompanyPlan } from '@orixa/shared';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true, versionKey: false })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: true, enum: CompanyPlan, default: CompanyPlan.FREE })
  plan: CompanyPlan;

  @Prop({ default: true })
  isActive: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Indexes
CompanySchema.index({ slug: 1 });
CompanySchema.index({ plan: 1 });
