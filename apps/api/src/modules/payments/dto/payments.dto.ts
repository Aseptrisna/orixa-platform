import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@orixa/shared';

export class CreatePaymentDto {
  @ApiProperty({ example: '6579a1234567890abcdef123' })
  @IsString()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ required: false, example: 'https://example.com/proof.jpg' })
  @IsOptional()
  @IsString()
  proofUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false, description: 'For POS cash payments' })
  @IsOptional()
  @IsBoolean()
  markAsPaid?: boolean;
}

export class ConfirmPaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectPaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
