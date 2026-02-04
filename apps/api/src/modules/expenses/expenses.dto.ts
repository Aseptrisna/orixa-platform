import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '@orixa/shared';

export class CreateExpenseDto {
  @ApiProperty({ example: 'BAHAN_BAKU', enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: 'Pembelian bahan baku mingguan' })
  @IsString()
  description: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Pembelian di Pasar Induk' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/receipt123.jpg' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 'BAHAN_BAKU', enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ example: 'Pembelian bahan baku mingguan' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'Pembelian di Pasar Induk' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/uploads/receipt123.jpg' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

export class ExpenseQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  outletId?: string;

  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  limit?: number;
}

export class ExpenseSummaryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  outletId?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'daily', enum: ['daily', 'monthly', 'yearly'] })
  @IsOptional()
  @IsString()
  period?: 'daily' | 'monthly' | 'yearly';
}
