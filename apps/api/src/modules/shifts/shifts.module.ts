import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShiftsService } from './shifts.service';
import { Shift, ShiftSchema } from '../../schemas';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Shift.name, schema: ShiftSchema }]),
    forwardRef(() => AuditModule),
  ],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
