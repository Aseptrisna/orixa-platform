import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { Table, TableDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType, ITable } from '@orixa/shared';
import { CreateTableDto, UpdateTableDto } from './dto';

const generateToken = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateTableDto, companyId: string, actorUserId: string): Promise<ITable> {
    const qrToken = generateToken();

    const table = await this.tableModel.create({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(dto.outletId),
      name: dto.name,
      qrToken,
      isActive: true,
    });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.CREATE,
      entityType: EntityType.TABLE,
      entityId: table._id.toString(),
      detail: { name: table.name },
    });

    return this.toTable(table);
  }

  async findByOutlet(outletId: string, companyId: string): Promise<ITable[]> {
    const tables = await this.tableModel.find({
      outletId: new Types.ObjectId(outletId),
      companyId: new Types.ObjectId(companyId),
    }).sort({ name: 1 });

    return tables.map((t) => this.toTable(t));
  }

  async findByQrToken(qrToken: string): Promise<TableDocument | null> {
    return this.tableModel.findOne({ qrToken, isActive: true });
  }

  async update(id: string, dto: UpdateTableDto, companyId: string, actorUserId: string): Promise<ITable> {
    const table = await this.tableModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    if (dto.name) table.name = dto.name;
    if (dto.isActive !== undefined) table.isActive = dto.isActive;

    await table.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.UPDATE,
      entityType: EntityType.TABLE,
      entityId: id,
    });

    return this.toTable(table);
  }

  async regenerateQrToken(id: string, companyId: string, actorUserId: string): Promise<ITable> {
    const table = await this.tableModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    table.qrToken = generateToken();
    await table.save();

    return this.toTable(table);
  }

  async delete(id: string, companyId: string, actorUserId: string): Promise<void> {
    const table = await this.tableModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    await this.tableModel.deleteOne({ _id: table._id });

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.DELETE,
      entityType: EntityType.TABLE,
      entityId: id,
    });
  }

  private toTable(doc: TableDocument): ITable {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      outletId: doc.outletId.toString(),
      name: doc.name,
      qrToken: doc.qrToken,
      isActive: doc.isActive,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
