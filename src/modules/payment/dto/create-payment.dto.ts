import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  salesOrderId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}