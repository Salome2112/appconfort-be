import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
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

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
