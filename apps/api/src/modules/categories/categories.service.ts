import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType, ICategory } from '@orixa/shared';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateCategoryDto, companyId: string, actorUserId: string): Promise<ICategory> {
    const category = await this.categoryModel.create({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(dto.outletId),
      name: dto.name,
      sortOrder: dto.sortOrder || 0,
      isActive: true,
    });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.CREATE,
      entityType: EntityType.CATEGORY,
      entityId: category._id.toString(),
      detail: { name: category.name },
    });

    return this.toCategory(category);
  }

  async findByOutlet(outletId: string, companyId: string): Promise<ICategory[]> {
    const categories = await this.categoryModel.find({
      outletId: new Types.ObjectId(outletId),
      companyId: new Types.ObjectId(companyId),
    }).sort({ sortOrder: 1, name: 1 });

    return categories.map((c) => this.toCategory(c));
  }

  async update(id: string, dto: UpdateCategoryDto, companyId: string, actorUserId: string): Promise<ICategory> {
    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) category.name = dto.name;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    await category.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.UPDATE,
      entityType: EntityType.CATEGORY,
      entityId: id,
    });

    return this.toCategory(category);
  }

  async delete(id: string, companyId: string, actorUserId: string): Promise<void> {
    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryModel.deleteOne({ _id: category._id });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.DELETE,
      entityType: EntityType.CATEGORY,
      entityId: id,
    });
  }

  private toCategory(doc: CategoryDocument): ICategory {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      outletId: doc.outletId.toString(),
      name: doc.name,
      sortOrder: doc.sortOrder,
      isActive: doc.isActive,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
