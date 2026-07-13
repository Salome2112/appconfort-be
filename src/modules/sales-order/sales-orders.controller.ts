// src/sales-orders/sales-orders.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

// No hay POST '/' público: una SalesOrder solo se crea automáticamente
// cuando un Quote es aceptado (ver QuotesService.accept). Tampoco hay
// DELETE: una orden de venta no se elimina, se anula (VOIDED).
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  findAll() {
    return this.salesOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalesOrderDto,
  ) {
    return this.salesOrdersService.update(id, dto);
  }

  @Post(':id/deliver')
  @HttpCode(HttpStatus.OK)
  deliver(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.deliver(id);
  }

  @Post(':id/void')
  @HttpCode(HttpStatus.OK)
  void(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.void(id);
  }
}
