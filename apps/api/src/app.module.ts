import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { TablesModule } from './modules/tables/tables.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AddonsModule } from './modules/addons/addons.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { PublicModule } from './modules/public/public.module';
import { PosModule } from './modules/pos/pos.module';
import { KdsModule } from './modules/kds/kds.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { SocketModule } from './modules/socket/socket.module';
import { MailModule } from './modules/mail/mail.module';
import { UploadModule } from './modules/upload/upload.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/orixa'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([{
        ttl: configService.get<number>('THROTTLE_TTL', 60000),
        limit: configService.get<number>('THROTTLE_LIMIT', 10),
      }]),
      inject: [ConfigService],
    }),
    MailModule,
    UploadModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    OutletsModule,
    TablesModule,
    CategoriesModule,
    AddonsModule,
    MenuItemsModule,
    OrdersModule,
    PaymentsModule,
    ShiftsModule,
    ReportsModule,
    AuditModule,
    PublicModule,
    PosModule,
    KdsModule,
    SuperAdminModule,
    SocketModule,
    ExpensesModule,
  ],
})
export class AppModule {}
