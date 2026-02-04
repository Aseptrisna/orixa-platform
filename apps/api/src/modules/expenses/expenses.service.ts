import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../../schemas/expense.schema';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, ExpenseSummaryQueryDto } from './expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async create(
    companyId: string,
    outletId: string,
    userId: string,
    dto: CreateExpenseDto,
  ): Promise<Expense> {
    const expense = new this.expenseModel({
      companyId: new Types.ObjectId(companyId),
      outletId: new Types.ObjectId(outletId),
      createdByUserId: new Types.ObjectId(userId),
      category: dto.category,
      description: dto.description,
      amount: dto.amount,
      date: new Date(dto.date),
      note: dto.note,
      receiptUrl: dto.receiptUrl,
    });
    return expense.save();
  }

  async findAll(
    companyId: string,
    query: ExpenseQueryDto,
  ): Promise<{ data: Expense[]; total: number; page: number; limit: number }> {
    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (query.outletId) {
      filter.outletId = new Types.ObjectId(query.outletId);
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) {
        filter.date.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.date.$lte = new Date(query.endDate + 'T23:59:59.999Z');
      }
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.expenseModel
        .find(filter)
        .populate('outletId', 'name')
        .populate('createdByUserId', 'name')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.expenseModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOne(companyId: string, id: string): Promise<Expense> {
    const expense = await this.expenseModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .populate('outletId', 'name')
      .populate('createdByUserId', 'name')
      .exec();

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.expenseModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (dto.category) expense.category = dto.category;
    if (dto.description) expense.description = dto.description;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.date) expense.date = new Date(dto.date);
    if (dto.note !== undefined) expense.note = dto.note;
    if (dto.receiptUrl !== undefined) expense.receiptUrl = dto.receiptUrl;

    return expense.save();
  }

  async remove(companyId: string, id: string): Promise<void> {
    const result = await this.expenseModel.deleteOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Expense not found');
    }
  }

  async getSummary(companyId: string, query: ExpenseSummaryQueryDto) {
    const matchStage: any = { companyId: new Types.ObjectId(companyId) };

    if (query.outletId) {
      matchStage.outletId = new Types.ObjectId(query.outletId);
    }

    if (query.startDate || query.endDate) {
      matchStage.date = {};
      if (query.startDate) {
        matchStage.date.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        matchStage.date.$lte = new Date(query.endDate + 'T23:59:59.999Z');
      }
    }

    // Total by category
    const byCategory = await this.expenseModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Total by outlet
    const byOutlet = await this.expenseModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$outletId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'outlets',
          localField: '_id',
          foreignField: '_id',
          as: 'outlet',
        },
      },
      { $unwind: '$outlet' },
      {
        $project: {
          outletId: '$_id',
          outletName: '$outlet.name',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Time series based on period
    let groupByDate: any;
    const period = query.period || 'daily';

    if (period === 'daily') {
      groupByDate = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' },
      };
    } else if (period === 'monthly') {
      groupByDate = {
        year: { $year: '$date' },
        month: { $month: '$date' },
      };
    } else {
      groupByDate = {
        year: { $year: '$date' },
      };
    }

    const timeSeries = await this.expenseModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupByDate,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Grand total
    const grandTotal = await this.expenseModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      grandTotal: grandTotal[0]?.total || 0,
      totalCount: grandTotal[0]?.count || 0,
      byCategory,
      byOutlet,
      timeSeries: timeSeries.map((item) => ({
        date:
          period === 'yearly'
            ? `${item._id.year}`
            : period === 'monthly'
              ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
              : `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        total: item.total,
        count: item.count,
      })),
    };
  }

  // Get expenses for export
  async findAllForExport(companyId: string, query: ExpenseQueryDto): Promise<Expense[]> {
    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (query.outletId) {
      filter.outletId = new Types.ObjectId(query.outletId);
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) {
        filter.date.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.date.$lte = new Date(query.endDate + 'T23:59:59.999Z');
      }
    }

    return this.expenseModel
      .find(filter)
      .populate('outletId', 'name')
      .populate('createdByUserId', 'name')
      .sort({ date: -1, createdAt: -1 })
      .exec();
  }
}
