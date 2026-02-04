import { IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyPlan } from '@orixa/shared';

export class UpdateCompanyPlanDto {
  @ApiProperty({ enum: CompanyPlan })
  @IsEnum(CompanyPlan)
  plan: CompanyPlan;
}

export class ToggleCompanyActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
