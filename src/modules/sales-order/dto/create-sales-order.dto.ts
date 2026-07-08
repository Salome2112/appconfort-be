import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { SalesOrderStatus } from '@prisma/client';

export class CreateSalesOrderDto {
  @IsString()
  number: string;

  @IsNumber()
  quoteId: number;

  @IsEnum(SalesOrderStatus)
  status: SalesOrderStatus;

  @IsNumber()
  quoteTotal: number;

  @IsNumber()
  pendingBalance: number;

  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @IsOptional()
  @IsDateString()
  agreedDeliveryDate?: string;

  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}