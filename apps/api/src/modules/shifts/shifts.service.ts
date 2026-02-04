import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType, IShift } from '@orixa/shared';
import { OpenShiftDto, CloseShiftDto } from './dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    private auditService: AuditService,
  ) {}

  async open(dto: OpenShiftDto, companyId: string, userId: string): Promise<IShift> {
    // Check if there's already an open shift for this user
    const existingShift = await this.shiftModel.findOne({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(dto.outletId),
      cashierUserId: new Types.ObjectId(userId),
      closedAt: null,
    });

    if (existingShift) {
      throw new BadRequestException('You already have an open shift. Please close it first.');
    }

    const shift = await this.shiftModel.create({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(dto.outletId),
      cashierUserId: new Types.ObjectId(userId),
      openedAt: new Date(),
      openingCash: dto.openingCash,
      note: dto.note,
    });

    await this.auditService.log({
      actorUserId: userId,
      companyId,
      action: AuditAction.SHIFT_OPEN,
      entityType: EntityType.SHIFT,
      entityId: shift._id.toString(),
      detail: { openingCash: dto.openingCash },
    });

    return this.toShift(shift);
  }

  async close(dto: CloseShiftDto, companyId: string, userId: string): Promise<IShift> {
    const shift = await this.shiftModel.findOne({
      companyId: new Types.ObjectId(companyId),
      cashierUserId: new Types.ObjectId(userId),
      closedAt: null,
    });

    if (!shift) {
      throw new NotFoundException('No open shift found');
    }

    shift.closedAt = new Date();
    shift.closingCash = dto.closingCash;
    if (dto.note) shift.note = (shift.note || '') + '\n' + dto.note;
    await shift.save();

    await this.auditService.log({
      actorUserId: userId,
      companyId,
      action: AuditAction.SHIFT_CLOSE,
      entityType: EntityType.SHIFT,
      entityId: shift._id.toString(),
      detail: { closingCash: dto.closingCash },
    });

    return this.toShift(shift);
  }

  async getCurrent(outletId: string, companyId: string, userId: string): Promise<IShift | null> {
    const shift = await this.shiftModel.findOne({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(outletId),
      cashierUserId: new Types.ObjectId(userId),
      closedAt: null,
    });

    return shift ? this.toShift(shift) : null;
  }

  private toShift(doc: ShiftDocument): IShift {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      outletId: doc.outletId.toString(),
      cashierUserId: doc.cashierUserId.toString(),
      openedAt: doc.openedAt,
      closedAt: doc.closedAt,
      openingCash: doc.openingCash,
      closingCash: doc.closingCash,
      note: doc.note,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
