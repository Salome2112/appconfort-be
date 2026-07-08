// eslint-disable-next-line prettier/prettier
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuoteItemDto {
  @IsInt()
  quoteId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  discountPercent?: number;

  @IsNumber()
  subtotal: number;

  @IsString()
  @IsOptional()
  customDetails?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}