import { IsString, IsOptional, IsArray, IsNumber, IsEnum, ValidateNested, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, CustomerType, PaymentMethod } from '@orixa/shared';

export class PosOrderItemDto {
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

export class PosCustomerDto {
  @ApiProperty({ enum: CustomerType })
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  memberUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreatePosOrderDto {
  @ApiProperty()
  @IsString()
  outletId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tableId?: string;

  @ApiProperty({ required: false, type: PosCustomerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PosCustomerDto)
  customer?: PosCustomerDto;

  @ApiProperty({ type: [PosOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosOrderItemDto)
  items: PosOrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false, enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ required: false, description: 'Mark as paid immediately (for CASH payments)' })
  @IsOptional()
  @IsBoolean()
  markAsPaid?: boolean;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
