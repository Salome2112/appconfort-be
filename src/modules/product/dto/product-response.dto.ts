// src/modules/product/dto/product-response.dto.ts
import { Product as PrismaProduct } from '@prisma/client';

export type ProductResponse = Omit<
  PrismaProduct,
  'materialCost' | 'laborCost' | 'overheadCost' | 'profitMargin' | 'basePrice' | 'finalPrice'
> & {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  profitMargin: number;
  basePrice: number;
  finalPrice: number;
};

