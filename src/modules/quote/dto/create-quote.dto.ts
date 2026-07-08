import { IsInt, IsOptional, IsString, IsEnum, IsDecimal } from 'class-validator';
import { QuoteStatus } from '@prisma/client';

export class CreateQuoteDto {
  @IsString()
  number: string;

  @IsInt()
  clientId: number;

  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @IsOptional()
  discountPercent?: number;

  @IsDecimal()
  subtotal: number;

  @IsOptional()
  discountAmount?: number;

  @IsOptional()
  taxAmount?: number;

  @IsDecimal()
  total: number;

  @IsOptional()
  deliveryDays?: number;

  @IsOptional()
  validityDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}