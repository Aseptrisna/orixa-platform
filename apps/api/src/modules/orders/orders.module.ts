import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order, OrderSchema, MenuItem, MenuItemSchema, Addon, AddonSchema, Outlet, OutletSchema, Payment, PaymentSchema } from '../../schemas';
import { AuditModule } from '../audit/audit.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Addon.name, schema: AddonSchema },
      { name: Outlet.name, schema: OutletSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    forwardRef(() => AuditModule),
    forwardRef(() => SocketModule),
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
