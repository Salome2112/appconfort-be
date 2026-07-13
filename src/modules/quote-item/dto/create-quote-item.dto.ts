// src/quote-items/dto/create-quote-item.dto.ts
import {
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateQuoteItemDto {
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

  // Si se omite, se agrega al final del listado actual
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
