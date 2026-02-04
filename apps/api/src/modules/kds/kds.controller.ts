import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission, OrderStatus, KDS_ACTIVE_STATUSES } from '@orixa/shared';
import { OrdersService } from '../orders/orders.service';
import { UpdateOrderStatusDto } from '../pos/dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Table, TableDocument } from '../../schemas';

@ApiTags('KDS')
@ApiBearerAuth()
@Controller('kds')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class KdsController {
  constructor(
    private readonly ordersService: OrdersService,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
  ) {}

  @Get('orders')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_READ)
  @ApiOperation({ summary: 'Get orders for KDS (kitchen display)' })
  async getOrders(
    @Query('outletId') outletId: string,
    @Query('status') status: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    const statusArray = status 
      ? status.split(',') as OrderStatus[]
      : KDS_ACTIVE_STATUSES;
    
    const result = await this.ordersService.findByOutlet(outletId, companyId, statusArray, 1, 100);
    
    // Get all unique tableIds from orders
    const tableIds = [...new Set(result.data.filter(o => o.tableId).map(o => o.tableId))];
    
    // Fetch table data
    const tables = await this.tableModel.find({
      _id: { $in: tableIds.map(id => new Types.ObjectId(id as string)) }
    });
    
    const tableMap = new Map(tables.map(t => [t._id.toString(), { _id: t._id.toString(), name: t.name }]));
    
    // Enrich orders with table info
    const enrichedData = result.data.map(order => ({
      ...order,
      table: order.tableId ? tableMap.get(order.tableId) : null,
    }));
    
    return {
      ...result,
      data: enrichedData,
    };
  }

  @Patch('orders/:id/status')
  @Roles(Role.CASHIER, Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.ORDER_WRITE)
  @ApiOperation({ summary: 'Update order status from KDS' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.ordersService.updateStatus(id, dto.status, companyId, userId);
  }
}
