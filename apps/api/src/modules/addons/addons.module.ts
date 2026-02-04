import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddonsService } from './addons.service';
import { AddonsController } from './addons.controller';
import { Addon, AddonSchema } from '../../schemas';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Addon.name, schema: AddonSchema }]),
    forwardRef(() => AuditModule),
  ],
  controllers: [AddonsController],
  providers: [AddonsService],
  exports: [AddonsService],
})
export class AddonsModule {}
