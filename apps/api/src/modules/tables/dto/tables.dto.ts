import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: '6579a1234567890abcdef123' })
  @IsString()
  outletId: string;

  @ApiProperty({ example: 'Meja 1' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}

export class UpdateTableDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
