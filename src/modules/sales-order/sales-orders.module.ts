// src/sales-orders/sales-orders.module.ts
import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';

@Module({
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
  // Se exporta para que QuotesModule pueda inyectar SalesOrdersService
  // y crear la orden automáticamente al aceptar una cotización.
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
