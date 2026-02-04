import { IsString, IsOptional, IsBoolean, IsNumber, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddonDto {
  @ApiProperty({ example: '6579a1234567890abcdef123' })
  @IsString()
  outletId: string;

  @ApiProperty({ example: 'Extra Cheese' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateAddonDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
