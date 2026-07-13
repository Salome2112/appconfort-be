// src/quotes/dto/quote-item.dto.ts
import {
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class QuoteItemDto {
  @IsInt()
  productId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  // Si se omite, el service toma el basePrice actual del producto
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsString()
  customDetails?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
