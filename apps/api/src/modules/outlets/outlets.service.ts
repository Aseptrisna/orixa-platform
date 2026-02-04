import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Outlet, OutletDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { 
  AuditAction, 
  EntityType, 
  IOutlet, 
  PaymentMethod, 
  RoundingMode, 
  OrderMode 
} from '@orixa/shared';
import { CreateOutletDto, UpdateOutletDto } from './dto';

@Injectable()
export class OutletsService {
  constructor(
    @InjectModel(Outlet.name) private outletModel: Model<OutletDocument>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateOutletDto, companyId: string, actorUserId: string): Promise<IOutlet> {
    const outlet = await this.outletModel.create({
      companyId: new Types.ObjectId(companyId),
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      timezone: dto.timezone || 'Asia/Jakarta',
      currency: dto.currency || 'IDR',
      settings: dto.settings || {
        taxRate: 10,
        serviceRate: 0,
        rounding: RoundingMode.NONE,
        orderMode: OrderMode.QR_AND_POS,
        paymentConfig: {
          enabledMethods: [PaymentMethod.CASH],
        },
      },
      isActive: true,
    });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.CREATE,
      entityType: EntityType.OUTLET,
      entityId: outlet._id.toString(),
      detail: { name: outlet.name },
    });

    return this.toOutlet(outlet);
  }

  async findAll(companyId: string) {
    const outlets = await this.outletModel.find({
      companyId: new Types.ObjectId(companyId),
    }).sort({ createdAt: -1 });

    return outlets.map((o) => this.toOutlet(o));
  }

  async findById(id: string, companyId: string): Promise<IOutlet> {
    const outlet = await this.outletModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    return this.toOutlet(outlet);
  }

  async update(id: string, dto: UpdateOutletDto, companyId: string, actorUserId: string): Promise<IOutlet> {
    const outlet = await this.outletModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    if (dto.name) outlet.name = dto.name;
    if (dto.address !== undefined) outlet.address = dto.address;
    if (dto.phone !== undefined) outlet.phone = dto.phone;
    if (dto.timezone) outlet.timezone = dto.timezone;
    if (dto.currency) outlet.currency = dto.currency;
    if (dto.isActive !== undefined) outlet.isActive = dto.isActive;

    if (dto.settings) {
      outlet.settings = {
        ...outlet.settings,
        ...dto.settings,
        paymentConfig: dto.settings.paymentConfig 
          ? { ...outlet.settings.paymentConfig, ...dto.settings.paymentConfig }
          : outlet.settings.paymentConfig,
      };
    }

    await outlet.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.UPDATE,
      entityType: EntityType.OUTLET,
      entityId: id,
    });

    return this.toOutlet(outlet);
  }

  async delete(id: string, companyId: string, actorUserId: string): Promise<void> {
    const outlet = await this.outletModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    await this.outletModel.deleteOne({ _id: outlet._id });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.DELETE,
      entityType: EntityType.OUTLET,
      entityId: id,
    });
  }

  private toOutlet(doc: OutletDocument): IOutlet {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      name: doc.name,
      address: doc.address,
      phone: doc.phone,
      timezone: doc.timezone,
      currency: doc.currency,
      settings: doc.settings,
      isActive: doc.isActive,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
