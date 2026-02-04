import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { Order, OrderDocument, MenuItem, MenuItemDocument, Addon, AddonDocument, Outlet, OutletDocument, Payment, PaymentDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { SocketGateway } from '../socket/socket.gateway';
import {
  AuditAction,
  EntityType,
  IOrder,
  OrderStatus,
  PaymentStatus,
  OrderChannel,
  CustomerType,
  IOrderItem,
  RoundingMode,
  SocketEvent,
  getStaffRoom,
  getCustomerRoom,
  PaymentMethod,
} from '@orixa/shared';
import { CreateOrderDto, OrderItemDto } from './dto';

const generateOrderCode = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Addon.name) private addonModel: Model<AddonDocument>,
    @InjectModel(Outlet.name) private outletModel: Model<OutletDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private auditService: AuditService,
    private socketGateway: SocketGateway,
  ) {}

  async create(dto: CreateOrderDto): Promise<IOrder> {
    const outlet = await this.outletModel.findById(dto.outletId);
    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Build order items with snapshots
    const items = await this.buildOrderItems(dto.items);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    // Calculate tax, service, discount
    const discount = dto.discount || 0;
    const taxRate = outlet.settings?.taxRate || 0;
    const serviceRate = outlet.settings?.serviceRate || 0;

    const taxableAmount = subtotal - discount;
    const tax = Math.round((taxableAmount * taxRate) / 100);
    const service = Math.round((taxableAmount * serviceRate) / 100);
    
    let total = subtotal - discount + tax + service;

    // Apply rounding
    total = this.applyRounding(total, outlet.settings?.rounding || RoundingMode.NONE);

    const orderCode = generateOrderCode();

    // Determine payment status based on markAsPaid
    const paymentStatus = dto.markAsPaid
      ? PaymentStatus.PAID 
      : PaymentStatus.UNPAID;

    const order = await this.orderModel.create({
      companyId: outlet.companyId,
      outletId: new Types.ObjectId(dto.outletId),
      tableId: dto.tableId ? new Types.ObjectId(dto.tableId) : null,
      sessionId: dto.sessionId,
      channel: dto.channel,
      customer: dto.customer || { type: CustomerType.GUEST },
      orderCode,
      items,
      subtotal,
      discount,
      tax,
      service,
      total,
      status: OrderStatus.NEW,
      paymentStatus,
      createdByUserId: dto.createdByUserId ? new Types.ObjectId(dto.createdByUserId) : null,
      note: dto.note,
    });

    // Create payment record if paymentMethod is provided
    if (dto.paymentMethod) {
      await this.paymentModel.create({
        companyId: outlet.companyId,
        outletId: new Types.ObjectId(dto.outletId),
        orderId: order._id,
        method: dto.paymentMethod,
        amount: total,
        status: paymentStatus === PaymentStatus.PAID ? PaymentStatus.PAID : PaymentStatus.PENDING,
        confirmedByUserId: dto.markAsPaid ? (dto.createdByUserId ? new Types.ObjectId(dto.createdByUserId) : null) : null,
      });
    }

    // Audit
    await this.auditService.log({
      actorUserId: dto.createdByUserId,
      companyId: outlet.companyId.toString(),
      action: AuditAction.CREATE,
      entityType: EntityType.ORDER,
      entityId: order._id.toString(),
      detail: { orderCode, channel: dto.channel },
    });

    // Emit socket event
    this.socketGateway.emitToRoom(
      getStaffRoom(outlet.companyId.toString(), dto.outletId),
      SocketEvent.ORDER_CREATED,
      this.toOrder(order),
    );

    return this.toOrder(order);
  }

  async findById(id: string): Promise<IOrder | null> {
    const order = await this.orderModel.findById(id);
    return order ? this.toOrder(order) : null;
  }

  async findByCode(orderCode: string): Promise<IOrder | null> {
    const order = await this.orderModel.findOne({ orderCode });
    return order ? this.toOrder(order) : null;
  }

  async findByOutlet(
    outletId: string | undefined,
    companyId: string,
    status?: OrderStatus[],
    page = 1,
    limit = 50,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {
      companyId: new Types.ObjectId(companyId),
    };

    // If outletId is provided, filter by it
    if (outletId) {
      query.outletId = new Types.ObjectId(outletId);
    }

    if (status && status.length > 0) {
      query.status = { $in: status };
    }

    const [data, total] = await Promise.all([
      this.orderModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.orderModel.countDocuments(query),
    ]);

    return {
      data: data.map((o) => this.toOrder(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    companyId: string,
    actorUserId?: string,
  ): Promise<IOrder> {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const oldStatus = order.status;
    order.status = status;

    // Auto-close payment if order is closed and paid
    if (status === OrderStatus.CLOSED && order.paymentStatus === PaymentStatus.PAID) {
      // Order is complete
    }

    await order.save();

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.STATUS_CHANGE,
      entityType: EntityType.ORDER,
      entityId: id,
      detail: { oldStatus, newStatus: status },
    });

    const orderData = this.toOrder(order);

    // Emit to staff room
    this.socketGateway.emitToRoom(
      getStaffRoom(companyId, order.outletId.toString()),
      SocketEvent.ORDER_STATUS_UPDATED,
      orderData,
    );

    // Emit to customer room
    this.socketGateway.emitToRoom(
      getCustomerRoom(id),
      SocketEvent.ORDER_STATUS_UPDATED,
      orderData,
    );

    return orderData;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void> {
    await this.orderModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { paymentStatus },
    );
  }

  private async buildOrderItems(itemDtos: OrderItemDto[]): Promise<IOrderItem[]> {
    const items: IOrderItem[] = [];

    for (const dto of itemDtos) {
      const menuItem = await this.menuItemModel.findById(dto.menuItemId);
      if (!menuItem || !menuItem.isActive) {
        throw new BadRequestException(`Menu item ${dto.menuItemId} not found or inactive`);
      }

      let unitPrice = menuItem.basePrice;
      let variantSnapshot = undefined;

      // Handle variant
      if (dto.variantName) {
        const variant = menuItem.variants?.find((v) => v.name === dto.variantName);
        if (variant) {
          unitPrice += variant.priceDelta;
          variantSnapshot = { name: variant.name, priceDelta: variant.priceDelta };
        }
      }

      // Handle addons
      let addonsSnapshot = undefined;
      if (dto.addonIds && dto.addonIds.length > 0) {
        const addons = await this.addonModel.find({
          _id: { $in: dto.addonIds.map((id) => new Types.ObjectId(id)) },
          isActive: true,
        });

        addonsSnapshot = addons.map((addon) => ({
          addonId: addon._id.toString(),
          name: addon.name,
          price: addon.price,
        }));

        unitPrice += addons.reduce((sum, addon) => sum + addon.price, 0);
      }

      const lineTotal = unitPrice * dto.qty;

      items.push({
        menuItemId: menuItem._id.toString(),
        nameSnapshot: menuItem.name,
        qty: dto.qty,
        basePriceSnapshot: menuItem.basePrice,
        variantSnapshot,
        addonsSnapshot,
        note: dto.note,
        lineTotal,
      });
    }

    return items;
  }

  private applyRounding(amount: number, mode: RoundingMode): number {
    switch (mode) {
      case RoundingMode.NEAREST_100:
        return Math.round(amount / 100) * 100;
      case RoundingMode.NEAREST_500:
        return Math.round(amount / 500) * 500;
      case RoundingMode.NEAREST_1000:
        return Math.round(amount / 1000) * 1000;
      default:
        return amount;
    }
  }

  private toOrder(doc: OrderDocument): IOrder {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      outletId: doc.outletId.toString(),
      tableId: doc.tableId?.toString(),
      sessionId: doc.sessionId,
      channel: doc.channel,
      customer: doc.customer,
      orderCode: doc.orderCode,
      items: doc.items,
      subtotal: doc.subtotal,
      discount: doc.discount,
      tax: doc.tax,
      service: doc.service,
      total: doc.total,
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      createdByUserId: doc.createdByUserId?.toString(),
      note: doc.note,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
