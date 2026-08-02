// src/modules/product/dto/product-response.dto.ts
import { Product as PrismaProduct } from '@prisma/client';

export type ProductResponse = Omit<
  PrismaProduct,
  'materialCost' | 'laborCost' | 'overheadCost' | 'profitMargin' | 'finalPrice'
> & {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  profitMargin: number;
  finalPrice: number;
};

