import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Outlet, OutletDocument,
  Table, TableDocument,
  Company, CompanyDocument,
  MenuItem, MenuItemDocument,
  Category, CategoryDocument,
  Addon, AddonDocument,
} from '../../schemas';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import {
  IQrResolveResponse,
  IMenuItem,
  ICategory,
  IAddon,
  OrderChannel,
  CustomerType,
  PaymentMethod,
} from '@orixa/shared';
import { CreatePublicOrderDto, CreatePublicPaymentDto } from './dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Outlet.name) private outletModel: Model<OutletDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Addon.name) private addonModel: Model<AddonDocument>,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
  ) {}

  async resolveQrToken(qrToken: string): Promise<IQrResolveResponse> {
    // Try to find table with this qrToken
    const table = await this.tableModel.findOne({ qrToken, isActive: true });

    let outlet: OutletDocument | null;
    let company: CompanyDocument | null;

    if (table) {
      outlet = await this.outletModel.findById(table.outletId);
      if (!outlet) {
        throw new NotFoundException('Outlet not found');
      }
      company = await this.companyModel.findById(outlet.companyId);
    } else {
      // qrToken might be outlet ID directly (for outlets without tables)
      outlet = await this.outletModel.findOne({
        $or: [
          { _id: Types.ObjectId.isValid(qrToken) ? new Types.ObjectId(qrToken) : null },
        ],
        isActive: true,
      });

      if (!outlet) {
        throw new NotFoundException('QR code not found');
      }
      company = await this.companyModel.findById(outlet.companyId);
    }

    if (!company || !company.isActive) {
      throw new NotFoundException('Company not found or inactive');
    }

    return {
      company: {
        _id: company._id.toString(),
        name: company.name,
        slug: company.slug,
      },
      outlet: {
        _id: outlet._id.toString(),
        companyId: outlet.companyId.toString(),
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
        timezone: outlet.timezone,
        currency: outlet.currency,
        settings: outlet.settings,
        isActive: outlet.isActive,
        createdAt: (outlet as any).createdAt,
        updatedAt: (outlet as any).updatedAt,
      },
      table: table ? {
        _id: table._id.toString(),
        name: table.name,
        qrToken: table.qrToken,
      } : undefined,
    };
  }

  async getMenu(outletId: string): Promise<{
    categories: ICategory[];
    items: IMenuItem[];
    addons: IAddon[];
  }> {
    const outlet = await this.outletModel.findById(outletId);
    if (!outlet || !outlet.isActive) {
      throw new NotFoundException('Outlet not found');
    }

    const [categories, items, addons] = await Promise.all([
      this.categoryModel.find({
        outletId: new Types.ObjectId(outletId),
        isActive: true,
      }).sort({ sortOrder: 1 }),
      this.menuItemModel.find({
        outletId: new Types.ObjectId(outletId),
        isActive: true,
      }),
      this.addonModel.find({
        outletId: new Types.ObjectId(outletId),
        isActive: true,
      }),
    ]);

    return {
      categories: categories.map((c) => ({
        _id: c._id.toString(),
        companyId: c.companyId.toString(),
        outletId: c.outletId.toString(),
        name: c.name,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        createdAt: (c as any).createdAt,
        updatedAt: (c as any).updatedAt,
      })),
      items: items.map((i) => ({
        _id: i._id.toString(),
        companyId: i.companyId.toString(),
        outletId: i.outletId.toString(),
        categoryId: i.categoryId.toString(),
        name: i.name,
        description: i.description,
        imageUrl: i.imageUrl,
        basePrice: i.basePrice,
        isActive: i.isActive,
        tags: i.tags,
        variants: i.variants,
        addonIds: i.addonIds?.map((id) => id.toString()),
        createdAt: (i as any).createdAt,
        updatedAt: (i as any).updatedAt,
      })),
      addons: addons.map((a) => ({
        _id: a._id.toString(),
        companyId: a.companyId.toString(),
        outletId: a.outletId.toString(),
        name: a.name,
        price: a.price,
        isActive: a.isActive,
        createdAt: (a as any).createdAt,
        updatedAt: (a as any).updatedAt,
      })),
    };
  }

  async createOrder(dto: CreatePublicOrderDto) {
    // Create order first
    const order = await this.ordersService.create({
      outletId: dto.outletId,
      tableId: dto.tableId,
      sessionId: dto.qrToken,
      channel: OrderChannel.QR,
      customer: {
        type: CustomerType.GUEST,
        name: dto.customer?.name,
        phone: dto.customer?.phone,
      },
      items: dto.items,
      note: dto.note,
    });

    // Create payment record with PENDING status (customer-initiated orders always need cashier confirmation)
    if (dto.paymentMethod) {
      await this.paymentsService.create({
        orderId: order._id,
        method: dto.paymentMethod,
        amount: order.total,
        markAsPaid: false, // Always PENDING for QR orders - cashier must confirm
      });
    }

    // Return order with payment info
    return this.getOrder(order._id);
  }

  async getOrder(orderId: string) {
    const order = await this.ordersService.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get outlet info
    const outlet = await this.outletModel.findById(order.outletId);
    
    // Get payment info if exists
    const payment = await this.paymentsService.findByOrderId(orderId);
    
    // Get payment instructions from outlet
    let paymentInstructions = null;
    if (outlet?.settings?.paymentConfig) {
      paymentInstructions = {
        transfer: outlet.settings.paymentConfig.transferInstructions,
        qr: outlet.settings.paymentConfig.qrInstructions,
      };
    }

    return {
      order,
      outlet: outlet ? {
        _id: outlet._id.toString(),
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
      } : null,
      payment,
      paymentInstructions,
    };
  }

  async getOrderByCode(orderCode: string) {
    const order = await this.ordersService.findByCode(orderCode);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async createPayment(dto: CreatePublicPaymentDto) {
    // Public payments are always PENDING (need cashier confirmation)
    return this.paymentsService.create({
      ...dto,
      markAsPaid: false,
    });
  }
}
