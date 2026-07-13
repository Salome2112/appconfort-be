import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDecimal,
  MaxLength,
} from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @MaxLength(30)
  sku: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsDecimal({ decimal_digits: '1,2' })
  basePrice: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
