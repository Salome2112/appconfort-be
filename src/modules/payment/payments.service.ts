// src/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { SalesOrdersService } from '../sales-order/sales-orders.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesOrdersService: SalesOrdersService,
  ) {}

  async create(dto: CreatePaymentDto) {
    // Transacción atómica: aplica el pago al saldo de la orden
    // (SalesOrdersService.applyPayment valida existencia, estado y que
    // el monto no exceda el pendingBalance) y crea el registro del pago.
    return this.prisma.$transaction(async (tx) => {
      await this.salesOrdersService.applyPayment(
        tx,
        dto.salesOrderId,
        dto.amount,
      );

      return tx.payment.create({
        data: {
          salesOrderId: dto.salesOrderId,
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          notes: dto.notes,
        },
        include: { salesOrder: true },
      });
    });
  }

  findAll(salesOrderId?: number) {
    return this.prisma.payment.findMany({
      where: salesOrderId ? { salesOrderId } : undefined,
      include: { salesOrder: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { salesOrder: true },
    });
    if (!payment) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
    return payment;
  }
}
