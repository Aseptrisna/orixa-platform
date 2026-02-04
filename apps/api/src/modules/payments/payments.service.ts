import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, Order, OrderDocument } from '../../schemas';
import { AuditService } from '../audit/audit.service';
import { OrdersService } from '../orders/orders.service';
import { SocketGateway } from '../socket/socket.gateway';
import {
  AuditAction,
  EntityType,
  IPayment,
  PaymentStatus,
  PaymentMethod,
  SocketEvent,
  getStaffRoom,
  getCustomerRoom,
} from '@orixa/shared';
import { CreatePaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private auditService: AuditService,
    private ordersService: OrdersService,
    private socketGateway: SocketGateway,
  ) {}

  async create(dto: CreatePaymentDto, actorUserId?: string): Promise<IPayment> {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if already paid
    const existingPayment = await this.paymentModel.findOne({
      orderId: new Types.ObjectId(dto.orderId),
      status: PaymentStatus.PAID,
    });

    if (existingPayment) {
      throw new BadRequestException('Order already paid');
    }

    // Determine initial status based on method
    const status = dto.method === PaymentMethod.CASH && dto.markAsPaid
      ? PaymentStatus.PAID
      : PaymentStatus.PENDING;

    const payment = await this.paymentModel.create({
      companyId: order.companyId,
      outletId: order.outletId,
      orderId: new Types.ObjectId(dto.orderId),
      method: dto.method,
      amount: dto.amount || order.total,
      status,
      proofUrl: dto.proofUrl,
      note: dto.note,
      confirmedByUserId: status === PaymentStatus.PAID && actorUserId
        ? new Types.ObjectId(actorUserId)
        : null,
    });

    // Update order payment status
    await this.ordersService.updatePaymentStatus(
      dto.orderId,
      status === PaymentStatus.PAID ? PaymentStatus.PAID : PaymentStatus.PENDING,
    );

    await this.auditService.log({
      actorUserId,
      companyId: order.companyId.toString(),
      action: AuditAction.CREATE,
      entityType: EntityType.PAYMENT,
      entityId: payment._id.toString(),
      detail: { method: dto.method, status },
    });

    const paymentData = this.toPayment(payment);

    // Emit events
    this.socketGateway.emitToRoom(
      getStaffRoom(order.companyId.toString(), order.outletId.toString()),
      SocketEvent.PAYMENT_CREATED,
      paymentData,
    );

    this.socketGateway.emitToRoom(
      getCustomerRoom(dto.orderId),
      SocketEvent.PAYMENT_CREATED,
      paymentData,
    );

    return paymentData;
  }

  async confirm(id: string, companyId: string, actorUserId: string, note?: string): Promise<IPayment> {
    const payment = await this.paymentModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already confirmed');
    }

    payment.status = PaymentStatus.PAID;
    payment.confirmedByUserId = new Types.ObjectId(actorUserId);
    if (note) payment.note = note;
    await payment.save();

    // Update order payment status
    await this.ordersService.updatePaymentStatus(
      payment.orderId.toString(),
      PaymentStatus.PAID,
    );

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.PAYMENT_CONFIRM,
      entityType: EntityType.PAYMENT,
      entityId: id,
    });

    const paymentData = this.toPayment(payment);

    // Emit events
    this.socketGateway.emitToRoom(
      getStaffRoom(companyId, payment.outletId.toString()),
      SocketEvent.PAYMENT_UPDATED,
      paymentData,
    );

    this.socketGateway.emitToRoom(
      getCustomerRoom(payment.orderId.toString()),
      SocketEvent.PAYMENT_UPDATED,
      paymentData,
    );

    return paymentData;
  }

  async reject(id: string, companyId: string, actorUserId: string, note?: string): Promise<IPayment> {
    const payment = await this.paymentModel.findOne({
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.REJECTED;
    if (note) payment.note = note;
    await payment.save();

    // Update order back to unpaid
    await this.ordersService.updatePaymentStatus(
      payment.orderId.toString(),
      PaymentStatus.UNPAID,
    );

    await this.auditService.log({
      actorUserId,
      companyId,
      action: AuditAction.PAYMENT_REJECT,
      entityType: EntityType.PAYMENT,
      entityId: id,
    });

    const paymentData = this.toPayment(payment);

    // Emit events
    this.socketGateway.emitToRoom(
      getStaffRoom(companyId, payment.outletId.toString()),
      SocketEvent.PAYMENT_UPDATED,
      paymentData,
    );

    this.socketGateway.emitToRoom(
      getCustomerRoom(payment.orderId.toString()),
      SocketEvent.PAYMENT_UPDATED,
      paymentData,
    );

    return paymentData;
  }

  async findByOrder(orderId: string): Promise<IPayment[]> {
    const payments = await this.paymentModel.find({
      orderId: new Types.ObjectId(orderId),
    }).sort({ createdAt: -1 });

    return payments.map((p) => this.toPayment(p));
  }

  async findByOrderId(orderId: string): Promise<IPayment | null> {
    const payment = await this.paymentModel.findOne({
      orderId: new Types.ObjectId(orderId),
    }).sort({ createdAt: -1 });

    return payment ? this.toPayment(payment) : null;
  }

  async confirmByOrderId(orderId: string, companyId: string, actorUserId: string, note?: string): Promise<IPayment> {
    // Find latest payment for this order
    const payment = await this.paymentModel.findOne({
      orderId: new Types.ObjectId(orderId),
      companyId: new Types.ObjectId(companyId),
    }).sort({ createdAt: -1 });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    // Use the existing confirm method
    return this.confirm(payment._id.toString(), companyId, actorUserId, note);
  }

  private toPayment(doc: PaymentDocument): IPayment {
    return {
      _id: doc._id.toString(),
      companyId: doc.companyId.toString(),
      outletId: doc.outletId.toString(),
      orderId: doc.orderId.toString(),
      method: doc.method,
      amount: doc.amount,
      status: doc.status,
      proofUrl: doc.proofUrl,
      note: doc.note,
      confirmedByUserId: doc.confirmedByUserId?.toString(),
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
