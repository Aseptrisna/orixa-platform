import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument, User, UserDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { ICompany, CompanyPlan, AuditAction, EntityType } from '@orixa/shared';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService,
  ) {}

  async listCompanies(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.companyModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.companyModel.countDocuments(query),
    ]);

    // Get admin count for each company
    const companiesWithAdmins = await Promise.all(
      data.map(async (company) => {
        const adminCount = await this.userModel.countDocuments({
          companyId: company._id,
        });
        return {
          ...this.toCompany(company),
          userCount: adminCount,
        };
      }),
    );

    return {
      data: companiesWithAdmins,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCompany(id: string) {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const userCount = await this.userModel.countDocuments({ companyId: company._id });

    return {
      ...this.toCompany(company),
      userCount,
    };
  }

  async updateCompanyPlan(
    id: string,
    plan: CompanyPlan,
    actorUserId: string,
  ): Promise<ICompany> {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const oldPlan = company.plan;
    company.plan = plan;
    await company.save();

    await this.auditService.log({
      actorUserId,
      companyId: id,
      action: AuditAction.UPDATE,
      entityType: EntityType.COMPANY,
      entityId: id,
      detail: { oldPlan, newPlan: plan },
    });

    return this.toCompany(company);
  }

  async toggleCompanyActive(
    id: string,
    isActive: boolean,
    actorUserId: string,
  ): Promise<ICompany> {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.isActive = isActive;
    await company.save();

    await this.auditService.log({
      actorUserId,
      companyId: id,
      action: AuditAction.UPDATE,
      entityType: EntityType.COMPANY,
      entityId: id,
      detail: { isActive },
    });

    return this.toCompany(company);
  }

  async getAuditLogs(page = 1, limit = 50) {
    return this.auditService.findAll(undefined, page, limit);
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
