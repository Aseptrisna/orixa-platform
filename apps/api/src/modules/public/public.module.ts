import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import {
  Outlet, OutletSchema,
  Table, TableSchema,
  Company, CompanySchema,
  MenuItem, MenuItemSchema,
  Category, CategorySchema,
  Addon, AddonSchema,
} from '../../schemas';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Outlet.name, schema: OutletSchema },
      { name: Table.name, schema: TableSchema },
      { name: Company.name, schema: CompanySchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Addon.name, schema: AddonSchema },
    ]),
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
