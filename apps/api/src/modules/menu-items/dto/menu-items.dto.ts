import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MenuItemVariantDto {
  @ApiProperty({ example: 'Large' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  priceDelta: number;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: '6579a1234567890abcdef123' })
  @IsString()
  outletId: string;

  @ApiProperty({ example: '6579a1234567890abcdef123' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'Nasi Goreng' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ required: false, example: 'Nasi goreng spesial dengan telur dan ayam' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ required: false, example: ['Pedas', 'Best Seller'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, type: [MenuItemVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemVariantDto)
  variants?: MenuItemVariantDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonIds?: string[];

  @ApiProperty({ required: false, default: true, description: 'Is menu available (not sold out)' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false, default: null, description: 'Stock count (null = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number | null;
}

export class UpdateMenuItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, type: [MenuItemVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemVariantDto)
  variants?: MenuItemVariantDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addonIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'Is menu available (not sold out)' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ required: false, description: 'Stock count (null = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number | null;
}

export class UpdateStockDto {
  @ApiProperty({ description: 'New stock value (null = unlimited)', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number | null;

  @ApiProperty({ description: 'Is available (true = tersedia, false = habis)', example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
