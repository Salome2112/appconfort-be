// src/sales-orders/sales-orders.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, SalesOrderStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { round2 } from '../../common/money.util';
import { PrismaTx } from '../../common/prisma-tx.type';

const withRelations = {
  quote: { include: { client: true } },
  payments: { orderBy: { createdAt: Prisma.SortOrder.asc } },
} satisfies Prisma.SalesOrderInclude;

@Injectable()
export class SalesOrdersService {
  constructor(private readonly prisma: PrismaService) { }

  // ── Helpers ──────────────────────────────────────────────

  private async generateOrderNumber(tx: PrismaTx): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SO-${year}-`;
    const count = await tx.salesOrder.count({
      where: { number: { startsWith: prefix } },
    });
    // Misma salvedad que en QuotesService.generateQuoteNumber: bajo alta
    // concurrencia convendría una secuencia de base de datos.
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  private assertTransition(
    current: SalesOrderStatus,
    allowed: SalesOrderStatus[],
  ) {
    if (!allowed.includes(current)) {
      throw new ConflictException(
        `No se puede realizar esta acción: la orden está en estado ${current}`,
      );
    }
  }

  // ── Creación automática (invocada por QuotesService.accept) ────

  /**
   * Crea la SalesOrder a partir de una Quote ya ACCEPTED.
   * Debe llamarse dentro de la misma transacción en la que se
   * actualiza el estado de la Quote, para garantizar consistencia.
   */
  async createFromQuote(tx: PrismaTx, quoteId: number, quoteTotal: number) {
    const existing = await tx.salesOrder.findUnique({ where: { quoteId } });
    if (existing) {
      throw new ConflictException(
        `La cotización ${quoteId} ya tiene una orden de venta asociada`,
      );
    }

    const number = await this.generateOrderNumber(tx);
    return tx.salesOrder.create({
      data: {
        number,
        quoteId,
        quoteTotal,
        pendingBalance: quoteTotal,
      },
    });
  }

  // ── CRUD de consulta / edición ──────────────────────────

  findAll() {
    return this.prisma.salesOrder.findMany({
      include: withRelations,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: withRelations,
    });
    if (!order) {
      throw new NotFoundException(`Orden de venta con id ${id} no encontrada`);
    }
    return order;
  }

  async findByQuoteId(quoteId: number) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { quoteId },
      include: withRelations,
    });

    if (!order) {
      throw new NotFoundException(
        `Orden de venta para la cotización con id ${quoteId} no encontrada`,
      );
    }
    return order;
  }

  async update(id: number, dto: UpdateSalesOrderDto) {
    const order = await this.findOne(id);
    this.assertTransition(order.status, [
      SalesOrderStatus.PENDING,
      SalesOrderStatus.DEPOSIT_PAID,
      SalesOrderStatus.DELIVERED,
    ]);

    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        agreedDeliveryDate: dto.agreedDeliveryDate
          ? new Date(dto.agreedDeliveryDate)
          : undefined,
        notes: dto.notes,
      },
      include: withRelations,
    });
  }

  // ── Transiciones de estado ──────────────────────────────

  async deliver(id: number) {
    const order = await this.findOne(id);
    this.assertTransition(order.status, [
      SalesOrderStatus.PENDING,
      SalesOrderStatus.DEPOSIT_PAID,
    ]);

    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        status: SalesOrderStatus.DELIVERED,
        actualDeliveryDate: new Date(),
      },
      include: withRelations,
    });
  }

  async void(id: number) {
    const order = await this.findOne(id);
    // Solo se puede anular antes de la entrega
    this.assertTransition(order.status, [
      SalesOrderStatus.PENDING,
      SalesOrderStatus.DEPOSIT_PAID,
    ]);

    return this.prisma.salesOrder.update({
      where: { id },
      data: { status: SalesOrderStatus.VOIDED },
      include: withRelations,
    });
  }

  async complete(id: number) {
    const order = await this.findOne(id);
    this.assertTransition(order.status, [
      SalesOrderStatus.PENDING,
      SalesOrderStatus.DEPOSIT_PAID,
      SalesOrderStatus.DELIVERED,
    ]);

    const totalPayments = order.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const quoteTotal = Number(order.quoteTotal);

    if (Math.abs(totalPayments - quoteTotal) > 0.01) {
      throw new ConflictException(
        `No se puede completar la orden: el total pagado ($${totalPayments}) no es igual al total de la venta ($${quoteTotal})`,
      );
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: { status: SalesOrderStatus.COMPLETED },
      include: withRelations,
    });
  }

  // ── Usado por PaymentsService (próxima entrega) ─────────

  /**
   * Aplica un pago recibido: reduce pendingBalance y ajusta el status.
   * - PENDING -> DEPOSIT_PAID en el primer pago.
   * - Si el saldo llega a 0 y la orden ya fue DELIVERED -> COMPLETED.
   * Debe llamarse dentro de una transacción compartida con la creación
   * del Payment, para que ambos cambios sean atómicos.
   */
  async applyPayment(tx: PrismaTx, salesOrderId: number, amount: number) {
    const order = await tx.salesOrder.findUnique({
      where: { id: salesOrderId },
    });
    if (!order) {
      throw new NotFoundException(
        `Orden de venta con id ${salesOrderId} no encontrada`,
      );
    }
    this.assertTransition(order.status, [
      SalesOrderStatus.PENDING,
      SalesOrderStatus.DEPOSIT_PAID,
      SalesOrderStatus.DELIVERED,
    ]);

    const newBalance = round2(Number(order.pendingBalance) - amount);
    if (newBalance < 0) {
      throw new ConflictException(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `El pago de ${amount} excede el saldo pendiente (${order.pendingBalance})`,
      );
    }

    let newStatus = order.status;
    if (newBalance === 0 && order.status === SalesOrderStatus.DELIVERED) {
      newStatus = SalesOrderStatus.COMPLETED;
    } else if (order.status === SalesOrderStatus.PENDING) {
      newStatus = SalesOrderStatus.DEPOSIT_PAID;
    }

    return tx.salesOrder.update({
      where: { id: salesOrderId },
      data: { pendingBalance: newBalance, status: newStatus },
    });
  }
}
