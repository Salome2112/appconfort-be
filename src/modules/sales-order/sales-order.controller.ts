import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { SalesOrderService } from './sales-order.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

@Controller('sales-order')
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  // Crear una orden de venta
  @Post()
  create(@Body() createSalesOrderDto: CreateSalesOrderDto) {
    return this.salesOrderService.create(createSalesOrderDto);
  }

  // Obtener todas las órdenes
  @Get()
  findAll() {
    return this.salesOrderService.findAll();
  }

  // Obtener una orden por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrderService.findOne(id);
  }

  // Actualizar una orden
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalesOrderDto: UpdateSalesOrderDto,
  ) {
    return this.salesOrderService.update(id, updateSalesOrderDto);
  }

  // Eliminar una orden
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrderService.remove(id);
  }
}