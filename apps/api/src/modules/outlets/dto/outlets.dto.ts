import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, RoundingMode, OrderMode } from '@orixa/shared';

export class TransferInstructionsDto {
  @ApiProperty({ example: 'BCA' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: 'PT Demo Company' })
  @IsString()
  accountName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  accountNumberOrVA: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class QrInstructionsDto {
  @ApiProperty({ example: 'https://example.com/qr.png' })
  @IsString()
  qrImageUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class PaymentConfigDto {
  @ApiProperty({ enum: PaymentMethod, isArray: true, example: [PaymentMethod.CASH, PaymentMethod.TRANSFER] })
  @IsArray()
  @IsEnum(PaymentMethod, { each: true })
  enabledMethods: PaymentMethod[];

  @ApiProperty({ required: false, type: TransferInstructionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransferInstructionsDto)
  transferInstructions?: TransferInstructionsDto;

  @ApiProperty({ required: false, type: QrInstructionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => QrInstructionsDto)
  qrInstructions?: QrInstructionsDto;
}

export class OutletSettingsDto {
  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  serviceRate?: number;

  @ApiProperty({ enum: RoundingMode })
  @IsOptional()
  @IsEnum(RoundingMode)
  rounding?: RoundingMode;

  @ApiProperty({ enum: OrderMode })
  @IsOptional()
  @IsEnum(OrderMode)
  orderMode?: OrderMode;

  @ApiProperty({ type: PaymentConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentConfigDto)
  paymentConfig?: PaymentConfigDto;
}

export class CreateOutletDto {
  @ApiProperty({ example: 'Outlet Utama' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Jl. Contoh No. 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, example: '021-1234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, example: 'Asia/Jakarta' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false, example: 'IDR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, type: OutletSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OutletSettingsDto)
  settings?: OutletSettingsDto;
}

export class UpdateOutletDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, type: OutletSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OutletSettingsDto)
  settings?: OutletSettingsDto;
}
