// src/payments/payments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

// Sin PUT/DELETE: los pagos son registros financieros inmutables.
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  // GET /payments                 -> todos los pagos
  // GET /payments?salesOrderId=5  -> pagos de una orden de venta específica
  @Get()
  findAll(
    @Query('salesOrderId', new ParseIntPipe({ optional: true }))
    salesOrderId?: number,
  ) {
    return this.paymentsService.findAll(salesOrderId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }
}
