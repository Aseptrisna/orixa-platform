import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, Payment, PaymentDocument } from '../../schemas';
import { Expense } from '../../schemas/expense.schema';
import { 
  IReportSummary, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod 
} from '@orixa/shared';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async getDailyReport(outletId: string, companyId: string, date: string): Promise<IReportSummary> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getReport(outletId, companyId, startOfDay, endOfDay);
  }

  async getRangeReport(
    outletId: string, 
    companyId: string, 
    startDate: string, 
    endDate: string,
  ): Promise<IReportSummary> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.getReport(outletId, companyId, start, end);
  }

  async exportToExcel(
    outletId: string,
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const matchStage = {
      outletId: new Types.ObjectId(outletId),
      companyId: new Types.ObjectId(companyId),
      createdAt: { $gte: start, $lte: end },
    };

    const orders = await this.orderModel.find(matchStage).sort({ createdAt: -1 });
    const summary = await this.getReport(outletId, companyId, start, end);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ORIXA';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    summarySheet.addRow({ metric: 'Total Orders', value: summary.totalOrders });
    summarySheet.addRow({ metric: 'Total Revenue', value: summary.totalRevenue });
    summarySheet.addRow({ metric: 'Total Tax', value: summary.totalTax });
    summarySheet.addRow({ metric: 'Total Service', value: summary.totalService });
    summarySheet.addRow({ metric: 'Total Discount', value: summary.totalDiscount });
    summarySheet.addRow({ metric: 'Average Order Value', value: summary.averageOrderValue });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Orders by Status', value: '' });
    Object.entries(summary.ordersByStatus).forEach(([status, count]) => {
      summarySheet.addRow({ metric: `  ${status}`, value: count });
    });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Orders by Payment Status', value: '' });
    Object.entries(summary.ordersByPaymentStatus).forEach(([status, count]) => {
      summarySheet.addRow({ metric: `  ${status}`, value: count });
    });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Orders by Payment Method', value: '' });
    Object.entries(summary.ordersByPaymentMethod).forEach(([method, count]) => {
      summarySheet.addRow({ metric: `  ${method}`, value: count });
    });

    // Style header
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Orders Sheet
    const ordersSheet = workbook.addWorksheet('Orders');
    ordersSheet.columns = [
      { header: 'Order Code', key: 'orderCode', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Channel', key: 'channel', width: 10 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Tax', key: 'tax', width: 15 },
      { header: 'Service', key: 'service', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    orders.forEach((order) => {
      ordersSheet.addRow({
        orderCode: order.orderCode,
        date: (order as any).createdAt?.toISOString() || new Date().toISOString(),
        channel: order.channel,
        customer: order.customer?.name || (order.customer?.type === 'GUEST' ? 'Guest' : 'Member'),
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        service: order.service,
        total: order.total,
      });
    });

    // Style orders header
    ordersSheet.getRow(1).font = { bold: true };
    ordersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };
    ordersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Format currency columns
    ['subtotal', 'discount', 'tax', 'service', 'total'].forEach((col) => {
      ordersSheet.getColumn(col).numFmt = '#,##0';
    });

    // Top Items Sheet
    const topItemsSheet = workbook.addWorksheet('Top Items');
    topItemsSheet.columns = [
      { header: 'Rank', key: 'rank', width: 10 },
      { header: 'Item Name', key: 'name', width: 30 },
      { header: 'Quantity Sold', key: 'qty', width: 15 },
      { header: 'Revenue', key: 'revenue', width: 15 },
    ];

    summary.topItems.forEach((item, index) => {
      topItemsSheet.addRow({
        rank: index + 1,
        name: item.name,
        qty: item.qty,
        revenue: item.revenue,
      });
    });

    // Style top items header
    topItemsSheet.getRow(1).font = { bold: true };
    topItemsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' },
    };
    topItemsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    topItemsSheet.getColumn('revenue').numFmt = '#,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async getReport(
    outletId: string,
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IReportSummary> {
    const matchStage = {
      outletId: new Types.ObjectId(outletId),
      companyId: new Types.ObjectId(companyId),
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // Get orders
    const orders = await this.orderModel.find(matchStage);

    // Calculate totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalTax = orders.reduce((sum, o) => sum + o.tax, 0);
    const totalService = orders.reduce((sum, o) => sum + o.service, 0);
    const totalDiscount = orders.reduce((sum, o) => sum + o.discount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus: Record<OrderStatus, number> = {} as any;
    Object.values(OrderStatus).forEach((status) => {
      ordersByStatus[status] = orders.filter((o) => o.status === status).length;
    });

    // Orders by payment status
    const ordersByPaymentStatus: Record<PaymentStatus, number> = {} as any;
    Object.values(PaymentStatus).forEach((status) => {
      ordersByPaymentStatus[status] = orders.filter((o) => o.paymentStatus === status).length;
    });

    // Get payments for method breakdown
    const payments = await this.paymentModel.find({
      ...matchStage,
      status: PaymentStatus.PAID,
    });

    const ordersByPaymentMethod: Record<PaymentMethod, number> = {} as any;
    Object.values(PaymentMethod).forEach((method) => {
      ordersByPaymentMethod[method] = payments.filter((p) => p.method === method).length;
    });

    // Top items
    const itemsMap = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItemId.toString();
        const existing = itemsMap.get(key);
        if (existing) {
          existing.qty += item.qty;
          existing.revenue += item.lineTotal;
        } else {
          itemsMap.set(key, {
            name: item.nameSnapshot,
            qty: item.qty,
            revenue: item.lineTotal,
          });
        }
      });
    });

    const topItems = Array.from(itemsMap.entries())
      .map(([menuItemId, data]) => ({ menuItemId, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return {
      totalOrders,
      totalRevenue,
      totalTax,
      totalService,
      totalDiscount,
      averageOrderValue,
      ordersByStatus,
      ordersByPaymentStatus,
      ordersByPaymentMethod,
      topItems,
    };
  }

  // Financial report with income vs expense
  async getFinancialReport(
    companyId: string,
    startDate: string,
    endDate: string,
    outletId?: string,
    period: 'daily' | 'monthly' | 'yearly' = 'daily',
  ) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const matchStageOrder: any = {
      companyId: new Types.ObjectId(companyId),
      createdAt: { $gte: start, $lte: end },
      paymentStatus: PaymentStatus.PAID,
    };

    const matchStageExpense: any = {
      companyId: new Types.ObjectId(companyId),
      date: { $gte: start, $lte: end },
    };

    if (outletId) {
      matchStageOrder.outletId = new Types.ObjectId(outletId);
      matchStageExpense.outletId = new Types.ObjectId(outletId);
    }

    // Group by date config
    let groupByDate: any;
    if (period === 'daily') {
      groupByDate = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
    } else if (period === 'monthly') {
      groupByDate = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    } else {
      groupByDate = {
        year: { $year: '$createdAt' },
      };
    }

    let groupByDateExpense: any;
    if (period === 'daily') {
      groupByDateExpense = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' },
      };
    } else if (period === 'monthly') {
      groupByDateExpense = {
        year: { $year: '$date' },
        month: { $month: '$date' },
      };
    } else {
      groupByDateExpense = {
        year: { $year: '$date' },
      };
    }

    // Income time series
    const incomeTimeSeries = await this.orderModel.aggregate([
      { $match: matchStageOrder },
      {
        $group: {
          _id: groupByDate,
          income: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Expense time series
    const expenseTimeSeries = await this.expenseModel.aggregate([
      { $match: matchStageExpense },
      {
        $group: {
          _id: groupByDateExpense,
          expense: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Merge time series
    const dateMap = new Map<string, { income: number; expense: number; orderCount: number; expenseCount: number }>();

    incomeTimeSeries.forEach((item) => {
      const dateKey =
        period === 'yearly'
          ? `${item._id.year}`
          : period === 'monthly'
            ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
            : `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      dateMap.set(dateKey, {
        income: item.income,
        expense: 0,
        orderCount: item.orderCount,
        expenseCount: 0,
      });
    });

    expenseTimeSeries.forEach((item) => {
      const dateKey =
        period === 'yearly'
          ? `${item._id.year}`
          : period === 'monthly'
            ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
            : `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      const existing = dateMap.get(dateKey);
      if (existing) {
        existing.expense = item.expense;
        existing.expenseCount = item.expenseCount;
      } else {
        dateMap.set(dateKey, {
          income: 0,
          expense: item.expense,
          orderCount: 0,
          expenseCount: item.expenseCount,
        });
      }
    });

    const timeSeries = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        profit: data.income - data.expense,
        orderCount: data.orderCount,
        expenseCount: data.expenseCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Totals
    const totalIncome = await this.orderModel.aggregate([
      { $match: matchStageOrder },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);

    const totalExpense = await this.expenseModel.aggregate([
      { $match: matchStageExpense },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // Expense by category
    const expenseByCategory = await this.expenseModel.aggregate([
      { $match: matchStageExpense },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Income by outlet (if no specific outlet)
    let incomeByOutlet = [];
    let expenseByOutlet = [];
    if (!outletId) {
      incomeByOutlet = await this.orderModel.aggregate([
        { $match: matchStageOrder },
        {
          $group: {
            _id: '$outletId',
            total: { $sum: '$total' },
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

      expenseByOutlet = await this.expenseModel.aggregate([
        { $match: matchStageExpense },
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
    }

    const income = totalIncome[0]?.total || 0;
    const expense = totalExpense[0]?.total || 0;

    return {
      summary: {
        totalIncome: income,
        totalExpense: expense,
        profit: income - expense,
        orderCount: totalIncome[0]?.count || 0,
        expenseCount: totalExpense[0]?.count || 0,
      },
      timeSeries,
      expenseByCategory: expenseByCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
      incomeByOutlet,
      expenseByOutlet,
    };
  }
}
