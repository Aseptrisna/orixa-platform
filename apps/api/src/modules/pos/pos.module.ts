import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [OrdersModule, PaymentsModule, ShiftsModule],
  controllers: [PosController],
})
export class PosModule {}
