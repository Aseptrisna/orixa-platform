import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType, IMenuItem } from '@orixa/shared';
import { CreateMenuItemDto, UpdateMenuItemDto, UpdateStockDto } from './dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateMenuItemDto, companyId: string, actorUserId: string): Promise<IMenuItem> {
    const menuItem = await this.menuItemModel.create({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(dto.outletId),
      categoryId: new Types.ObjectId(dto.categoryId),
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      basePrice: dto.basePrice,
      tags: dto.tags || [],
      variants: dto.variants || [],
      addonIds: dto.addonIds?.map((id) => new Types.ObjectId(id)) || [],
      isActive: true,
      isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
      stock: dto.stock !== undefined ? dto.stock : null,
    });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.CREATE,
      entityType: EntityType.MENU_ITEM,
      entityId: menuItem._id.toString(),
      detail: { name: menuItem.name },
    });

    return this.toMenuItem(menuItem);
  }

  async findByOutlet(outletId: string, companyId: string, activeOnly = false): Promise<IMenuItem[]> {
    const query: any = {
      outletId: new Types.ObjectId(outletId),
      companyId: new Types.ObjectId(companyId),
    };

    if (activeOnly) {
      query.isActive = true;
    }

    const items = await this.menuItemModel
      .find(query)
      .populate('categoryId', 'name sortOrder')
      .sort({ 'categoryId.sortOrder': 1, name: 1 });

    return items.map((i) => this.toMenuItem(i));
  }

  async findById(id: string): Promise<MenuItemDocument | null> {
    return this.menuItemModel.findById(id);
  }

  async update(id: string, dto: UpdateMenuItemDto, companyId: string, actorUserId: string): Promise<IMenuItem> {
    const menuItem = await this.menuItemModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (dto.categoryId) menuItem.categoryId = new Types.ObjectId(dto.categoryId);
    if (dto.name) menuItem.name = dto.name;
    if (dto.description !== undefined) menuItem.description = dto.description;
    if (dto.imageUrl !== undefined) menuItem.imageUrl = dto.imageUrl || '';
    if (dto.basePrice !== undefined) menuItem.basePrice = dto.basePrice;
    if (dto.tags) menuItem.tags = dto.tags;
    if (dto.variants) menuItem.variants = dto.variants;
    if (dto.addonIds) menuItem.addonIds = dto.addonIds.map((id) => new Types.ObjectId(id));
    if (dto.isActive !== undefined) menuItem.isActive = dto.isActive;
    if (dto.isAvailable !== undefined) menuItem.isAvailable = dto.isAvailable;
    if (dto.stock !== undefined) menuItem.stock = dto.stock;

    await menuItem.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.UPDATE,
      entityType: EntityType.MENU_ITEM,
      entityId: id,
    });

    return this.toMenuItem(menuItem);
  }

  async updateStock(id: string, dto: UpdateStockDto, companyId: string, actorUserId: string): Promise<IMenuItem> {
    const menuItem = await this.menuItemModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    if (dto.isAvailable !== undefined) menuItem.isAvailable = dto.isAvailable;
    if (dto.stock !== undefined) menuItem.stock = dto.stock;

    // Auto set isAvailable to false if stock reaches 0
    if (menuItem.stock !== null && menuItem.stock <= 0) {
      menuItem.isAvailable = false;
    }

    await menuItem.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.UPDATE,
      entityType: EntityType.MENU_ITEM,
      entityId: id,
      detail: { stock: dto.stock, isAvailable: dto.isAvailable },
    });

    return this.toMenuItem(menuItem);
  }

  // Reduce stock when order is placed
  async reduceStock(id: string, quantity: number): Promise<void> {
    const menuItem = await this.menuItemModel.findById(id);
    if (!menuItem || menuItem.stock === null) return;

    menuItem.stock = Math.max(0, menuItem.stock - quantity);
    if (menuItem.stock === 0) {
      menuItem.isAvailable = false;
    }
    await menuItem.save();
  }

  async delete(id: string, companyId: string, actorUserId: string): Promise<void> {
    const menuItem = await this.menuItemModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.menuItemModel.deleteOne({ _id: menuItem._id });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.DELETE,
      entityType: EntityType.MENU_ITEM,
      entityId: id,
    });
  }

  private toMenuItem(doc: MenuItemDocument): IMenuItem {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      outletId: doc.outletId.toString(),
      categoryId: doc.categoryId.toString(),
      name: doc.name,
      description: doc.description,
      imageUrl: doc.imageUrl,
      basePrice: doc.basePrice,
      isActive: doc.isActive,
      isAvailable: doc.isAvailable ?? true,
      stock: doc.stock ?? null,
      tags: doc.tags,
      variants: doc.variants,
      addonIds: doc.addonIds?.map((id) => id.toString()),
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
