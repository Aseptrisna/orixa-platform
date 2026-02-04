import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Addon, AddonDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType, IAddon } from '@orixa/shared';
import { CreateAddonDto, UpdateAddonDto } from './dto';

@Injectable()
export class AddonsService {
  constructor(
    @InjectModel(Addon.name) private addonModel: Model<AddonDocument>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateAddonDto, companyId: string, actorUserId: string): Promise<IAddon> {
    const addon = await this.addonModel.create({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(dto.outletId),
      name: dto.name,
      price: dto.price,
      isActive: true,
    });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.CREATE,
      entityType: EntityType.ADDON,
      entityId: addon._id.toString(),
      detail: { name: addon.name },
    });

    return this.toAddon(addon);
  }

  async findByOutlet(outletId: string, companyId: string): Promise<IAddon[]> {
    const addons = await this.addonModel.find({
      outletId: new Types.ObjectId(outletId),
      companyId: new Types.ObjectId(companyId),
    }).sort({ name: 1 });

    return addons.map((a) => this.toAddon(a));
  }

  async findByIds(ids: string[]): Promise<AddonDocument[]> {
    return this.addonModel.find({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
      isActive: true,
    });
  }

  async update(id: string, dto: UpdateAddonDto, companyId: string, actorUserId: string): Promise<IAddon> {
    const addon = await this.addonModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!addon) {
      throw new NotFoundException('Addon not found');
    }

    if (dto.name) addon.name = dto.name;
    if (dto.price !== undefined) addon.price = dto.price;
    if (dto.isActive !== undefined) addon.isActive = dto.isActive;

    await addon.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.UPDATE,
      entityType: EntityType.ADDON,
      entityId: id,
    });

    return this.toAddon(addon);
  }

  async delete(id: string, companyId: string, actorUserId: string): Promise<void> {
    const addon = await this.addonModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!addon) {
      throw new NotFoundException('Addon not found');
    }

    await this.addonModel.deleteOne({ _id: addon._id });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.DELETE,
      entityType: EntityType.ADDON,
      entityId: id,
    });
  }

  private toAddon(doc: AddonDocument): IAddon {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      outletId: doc.outletId.toString(),
      name: doc.name,
      price: doc.price,
      isActive: doc.isActive,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
