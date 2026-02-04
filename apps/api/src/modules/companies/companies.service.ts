import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { AuditAction, EntityType, ICompany } from '@orixa/shared';
import { UpdateCompanyDto } from './dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private auditService: AuditService,
  ) {}

  async findById(id: string): Promise<ICompany> {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return this.toCompany(company);
  }

  async update(id: string, dto: UpdateCompanyDto, actorUserId: string): Promise<ICompany> {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (dto.name) company.name = dto.name;
    if (dto.isActive !== undefined) company.isActive = dto.isActive;

    await company.save();

    await this.auditService.log({
      actorUserId,
      companyId: id,
      action: AuditAction.UPDATE,
      entityType: EntityType.COMPANY,
      entityId: id,
    });

    return this.toCompany(company);
  }

  private toCompany(doc: CompanyDocument): ICompany {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      plan: doc.plan,
      isActive: doc.isActive,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
