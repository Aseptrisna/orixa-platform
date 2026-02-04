import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KdsController } from './kds.controller';
import { OrdersModule } from '../orders/orders.module';
import { Table, TableSchema } from '../../schemas';

@Module({
  imports: [
    OrdersModule,
    MongooseModule.forFeature([{ name: Table.name, schema: TableSchema }]),
  ],
  controllers: [KdsController],
})
export class KdsModule {}
