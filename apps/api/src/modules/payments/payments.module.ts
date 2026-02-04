import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema, Order, OrderSchema } from '../../schemas';
import { AuditModule } from '../audit/audit.module';
import { SocketModule } from '../socket/socket.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    forwardRef(() => AuditModule),
    forwardRef(() => SocketModule),
    forwardRef(() => OrdersModule),
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
