// src/quotes/dto/create-quote.dto.ts
import {
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteItemDto } from './quote-item.dto';

export class CreateQuoteDto {
  @IsInt()
  clientId: number;

  // Descuento global sobre el subtotal (%)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPercent?: number;

  // % de impuesto a aplicar sobre (subtotal - descuento). No persiste como
  // campo propio: solo se usa para calcular taxAmount.
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  validityDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items?: QuoteItemDto[];
}
