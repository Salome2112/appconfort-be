// src/modules/product/dto/product-response.dto.ts
import { Product as PrismaProduct } from '@prisma/client';

export type ProductResponse = Omit<PrismaProduct, 'basePrice'> & {
  basePrice: number;
};
