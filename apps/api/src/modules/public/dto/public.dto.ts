import { IsString, IsOptional, IsArray, IsNumber, IsEnum, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@orixa/shared';

export class PublicOrderItemDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  variantName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class PublicCustomerDto {
  @ApiProperty({ required: false, example: 'John' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: '08123456789' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreatePublicOrderDto {
  @ApiProperty()
  @IsString()
  outletId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tableId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  qrToken?: string;

  @ApiProperty({ required: false, type: PublicCustomerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PublicCustomerDto)
  customer?: PublicCustomerDto;

  @ApiProperty({ type: [PublicOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicOrderItemDto)
  items: PublicOrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false, enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class CreatePublicPaymentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  proofUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
