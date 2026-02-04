import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission, OrderStatus, OrderChannel, CustomerType } from '@orixa/shared';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { ShiftsService } from '../shifts/shifts.service';
import { CreatePosOrderDto, UpdateOrderStatusDto } from './dto';
import { CreatePaymentDto, ConfirmPaymentDto, RejectPaymentDto } from '../payments/dto';
import { OpenShiftDto, CloseShiftDto } from '../shifts/dto';

@ApiTags('POS')
@ApiBearerAuth()
@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class PosController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly shiftsService: ShiftsService,
  ) {}

  // Orders
  @Post('orders')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_WRITE)
  @ApiOperation({ summary: 'Create POS order' })
  async createOrder(
    @Body() dto: CreatePosOrderDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.ordersService.create({
      ...dto,
      channel: OrderChannel.POS,
      customer: dto.customer || { type: CustomerType.GUEST },
      createdByUserId: userId,
    });
  }

  @Get('orders')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_READ)
  @ApiOperation({ summary: 'List orders by outlet' })
  async getOrders(
    @Query('outletId') outletId: string,
    @Query('status') status: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @CurrentUser('companyId') companyId: string,
  ) {
    const statusArray = status ? status.split(',') as OrderStatus[] : undefined;
    const result = await this.ordersService.findByOutlet(outletId || undefined, companyId, statusArray, +page, +limit);
    
    // Enrich orders with payment method info
    const enrichedData = await Promise.all(
      result.data.map(async (order) => {
        const payment = await this.paymentsService.findByOrderId(order._id);
        return {
          ...order,
          paymentMethod: payment?.method || null,
        };
      })
    );

    return {
      ...result,
      data: enrichedData,
    };
  }

  @Patch('orders/:id/status')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_WRITE)
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.ordersService.updateStatus(id, dto.status, companyId, userId);
  }

  // Payments
  @Post('payments')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.PAYMENT_WRITE)
  @ApiOperation({ summary: 'Create payment (can mark as PAID for cash)' })
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.create(dto, userId);
  }

  @Patch('payments/:id/confirm')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.PAYMENT_WRITE)
  @ApiOperation({ summary: 'Confirm payment (mark as PAID)' })
  async confirmPayment(
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.confirm(id, companyId, userId, dto.note);
  }

  @Patch('payments/:id/reject')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.PAYMENT_WRITE)
  @ApiOperation({ summary: 'Reject payment' })
  async rejectPayment(
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.reject(id, companyId, userId, dto.note);
  }

  @Patch('orders/:id/confirm-payment')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.PAYMENT_WRITE)
  @ApiOperation({ summary: 'Confirm payment by order ID' })
  async confirmPaymentByOrder(
    @Param('id') orderId: string,
    @Body() dto: ConfirmPaymentDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.confirmByOrderId(orderId, companyId, userId, dto.note);
  }

  // Shifts
  @Post('shifts/open')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_WRITE)
  @ApiOperation({ summary: 'Open a shift' })
  async openShift(
    @Body() dto: OpenShiftDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.shiftsService.open(dto, companyId, userId);
  }

  @Post('shifts/close')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_WRITE)
  @ApiOperation({ summary: 'Close current shift' })
  async closeShift(
    @Body() dto: CloseShiftDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.shiftsService.close(dto, companyId, userId);
  }

  @Get('shifts/current')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_READ)
  @ApiOperation({ summary: 'Get current open shift' })
  async getCurrentShift(
    @Query('outletId') outletId: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.shiftsService.getCurrent(outletId, companyId, userId);
  }
}
