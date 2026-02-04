import { IsString, IsOptional, IsNumber, IsArray, IsEnum, ValidateNested, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderChannel, CustomerType, PaymentMethod } from '@orixa/shared';

export class OrderItemDto {
  @ApiProperty({ example: '6579a1234567890abcdef123' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiProperty({ required: false, example: 'Large' })
  @IsOptional()
  @IsString()
  variantName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonIds?: string[];

  @ApiProperty({ required: false, example: 'Extra pedas' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class OrderCustomerDto {
  @ApiProperty({ enum: CustomerType, example: CustomerType.GUEST })
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  memberUserId?: string;

  @ApiProperty({ required: false, example: 'John' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: '08123456789' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: '6579a1234567890abcdef123' })
  @IsString()
  outletId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tableId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ enum: OrderChannel, example: OrderChannel.POS })
  @IsEnum(OrderChannel)
  channel: OrderChannel;

  @ApiProperty({ required: false, type: OrderCustomerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderCustomerDto)
  customer?: OrderCustomerDto;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ required: false, example: 0 })
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

  @ApiProperty({ required: false, description: 'Mark as paid immediately (for CASH)' })
  @IsOptional()
  @IsBoolean()
  markAsPaid?: boolean;

  // Internal use
  createdByUserId?: string;
}
