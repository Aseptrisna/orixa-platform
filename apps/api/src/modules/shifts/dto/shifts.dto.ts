import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenShiftDto {
  @ApiProperty()
  @IsString()
  outletId: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  openingCash: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CloseShiftDto {
  @ApiProperty({ example: 1500000 })
  @IsNumber()
  @Min(0)
  closingCash: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
