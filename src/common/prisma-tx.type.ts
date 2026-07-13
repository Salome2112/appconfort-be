// src/common/prisma-tx.type.ts
import { PrismaClient } from '@prisma/client';

// Tipo del cliente Prisma dentro de un $transaction (sin los métodos
// que no están disponibles en ese contexto). Se reutiliza en los
// services que necesitan participar en transacciones compartidas
// (QuotesService, QuoteItemsService, SalesOrdersService, etc.)
export type PrismaTx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
