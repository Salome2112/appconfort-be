// src/quotes/quotes.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, QuoteStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteItemDto } from './dto/quote-item.dto';
import { SalesOrdersService } from '../sales-order/sales-orders.service';

// include reutilizable para las respuestas
const withRelations = {
  client: true,
  items: {
    include: { product: true },
    orderBy: { sortOrder: Prisma.SortOrder.asc },
  },
  salesOrder: true,
} satisfies Prisma.QuoteInclude;

// Redondeo a 2 decimales evitando errores de coma flotante
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

interface ComputedItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  customDetails?: string;
  sortOrder: number;
}

interface ComputedTotals {
  items: ComputedItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesOrdersService: SalesOrdersService,
  ) { }

  // ── Helpers ──────────────────────────────────────────────

  private async generateQuoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QUO-${year}-`;
    const count = await this.prisma.quote.count({
      where: { number: { startsWith: prefix } },
    });
    // Nota: para alta concurrencia conviene reemplazar esto por una
    // secuencia de base de datos; aquí basta con el conteo + reintento
    // simple ya que el campo "number" es @unique.
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  private async computeTotals(
    items: QuoteItemDto[],
    discountPercent = 0,
    taxPercent = 0,
  ): Promise<ComputedTotals> {
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const missing = productIds.filter((id) => !productMap.has(id));
    if (missing.length) {
      throw new BadRequestException(
        `Producto(s) no encontrado(s): ${missing.join(', ')}`,
      );
    }

    const computedItems: ComputedItem[] = items.map((item, index) => {
      const product = productMap.get(item.productId)!;
      const quantity = item.quantity ?? 1;
      const unitPrice = item.unitPrice ?? Number(product.finalPrice);
      const itemDiscount = item.discountPercent ?? 0;

      const gross = unitPrice * quantity;
      const subtotal = round2(gross * (1 - itemDiscount / 100));

      return {
        productId: item.productId,
        quantity,
        unitPrice,
        discountPercent: itemDiscount,
        subtotal,
        customDetails: item.customDetails,
        sortOrder: item.sortOrder ?? index,
      };
    });

    const subtotal = round2(
      computedItems.reduce((sum, i) => sum + i.subtotal, 0),
    );
    const discountAmount = round2(subtotal * (discountPercent / 100));
    const taxable = subtotal - discountAmount;
    const taxAmount = round2(taxable * (taxPercent / 100));
    const total = round2(taxable + taxAmount);

    return { items: computedItems, subtotal, discountAmount, taxAmount, total };
  }

  private assertTransition(current: QuoteStatus, allowed: QuoteStatus[]) {
    if (!allowed.includes(current)) {
      throw new ConflictException(
        `No se puede realizar esta acción: la cotización está en estado ${current}`,
      );
    }
  }

  // ── CRUD ─────────────────────────────────────────────────
  async create(dto: CreateQuoteDto) {
    // 1. Verifica que el cliente exista
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException(
        `Cliente con id ${dto.clientId} no encontrado`,
      );
    }

    // 2. Si vienen ítems se calculan los totales, si no, se inicializan en 0
    const hasItems = dto.items && dto.items.length > 0;
    const totals = hasItems
      ? await this.computeTotals(dto.items!, dto.discountPercent, dto.taxPercent)
      : { subtotal: 0, discountAmount: 0, taxAmount: 0, total: 0, items: [] };

    // 3. Crea la proforma en la base de datos
    return this.prisma.quote.create({
      data: {
        number: `PF-${Date.now()}`,
        clientId: dto.clientId,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total,
        status: 'DRAFT', // Se crea automáticamente como borrador
        // Si hay ítems, los mapea; si no, el arreglo queda vacío
        items: hasItems
          ? {
            create: totals.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent,
              subtotal: item.subtotal,
              customDetails: item.customDetails,
              sortOrder: item.sortOrder,
            })),
          }
          : undefined,
      },
      include: withRelations,
    });
  }

  findAll() {
    return this.prisma.quote.findMany({
      include: withRelations,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: withRelations,
    });
    if (!quote) {
      throw new NotFoundException(`Cotización con id ${id} no encontrada`);
    }
    return quote;
  }

  async update(id: number, dto: UpdateQuoteDto) {
    const quote = await this.findOne(id);
    // Se puede editar si está en borrador o enviada
    this.assertTransition(quote.status, [QuoteStatus.DRAFT, QuoteStatus.SENT]);

    const items =
      dto.items ??
      quote.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discountPercent: Number(i.discountPercent),
        customDetails: i.customDetails ?? undefined,
        sortOrder: i.sortOrder,
      }));

    const discountPercent =
      dto.discountPercent ?? Number(quote.discountPercent);
    const taxPercent =
      dto.taxPercent ??
      (Number(quote.subtotal) - Number(quote.discountAmount) > 0
        ? round2(
          (Number(quote.taxAmount) /
            (Number(quote.subtotal) - Number(quote.discountAmount))) *
          100,
        )
        : 0);

    const totals = await this.computeTotals(items, discountPercent, taxPercent);

    let expiresAt: Date | undefined;
    if (dto.validityDays) {
      expiresAt = new Date(quote.issuedAt);
      expiresAt.setDate(expiresAt.getDate() + dto.validityDays);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.quoteItem.deleteMany({ where: { quoteId: id } });
      }

      return tx.quote.update({
        where: { id },
        data: {
          discountPercent,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          total: totals.total,
          deliveryDays: dto.deliveryDays,
          validityDays: dto.validityDays,
          notes: dto.notes,
          internalNotes: dto.internalNotes,
          expiresAt,
          items: dto.items
            ? {
              create: totals.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPercent: item.discountPercent,
                subtotal: item.subtotal,
                customDetails: item.customDetails,
                sortOrder: item.sortOrder,
              })),
            }
            : undefined,
        },
        include: withRelations,
      });
    });
  }

  // ── Transiciones de estado ──────────────────────────────

  async send(id: number) {
    const quote = await this.findOne(id);
    this.assertTransition(quote.status, [QuoteStatus.DRAFT, QuoteStatus.SENT]);
    return this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.SENT },
      include: withRelations,
    });
  }

  async accept(id: number) {
    const quote = await this.findOne(id);
    this.assertTransition(quote.status, [QuoteStatus.SENT]);
    return this.prisma.$transaction(async (tx) => {
      const updatedQuote = await tx.quote.update({
        where: { id },
        data: { status: QuoteStatus.ACCEPTED, acceptedAt: new Date() },
        include: withRelations,
      });

      await this.salesOrdersService.createFromQuote(
        tx,
        updatedQuote.id,
        Number(updatedQuote.total),
      );

      return updatedQuote;
    });
  }

  async reject(id: number) {
    const quote = await this.findOne(id);
    this.assertTransition(quote.status, [QuoteStatus.SENT]);
    return this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.REJECTED },
      include: withRelations,
    });
  }

  async cancel(id: number) {
    const quote = await this.findOne(id);
    this.assertTransition(quote.status, [QuoteStatus.DRAFT, QuoteStatus.SENT]);
    return this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.CANCELLED },
      include: withRelations,
    });
  }

  async updateStatus(id: number, status: QuoteStatus) {
    switch (status) {
      case QuoteStatus.SENT:
        return this.send(id);
      case QuoteStatus.ACCEPTED:
        return this.accept(id);
      case QuoteStatus.REJECTED:
        return this.reject(id);
      case QuoteStatus.CANCELLED:
        return this.cancel(id);
      case QuoteStatus.DRAFT:
        return this.prisma.quote.update({
          where: { id },
          data: { status: QuoteStatus.DRAFT },
          include: withRelations,
        });
      default:
        throw new BadRequestException(`Estado no válido: ${status}`);
    }
  }

  async remove(id: number) {
    const quote = await this.findOne(id);
    // Solo se permite borrar cotizaciones en borrador (no enviadas/aceptadas)
    this.assertTransition(quote.status, [QuoteStatus.DRAFT]);
    // items se eliminan en cascada por onDelete: Cascade en el schema
    return this.prisma.quote.delete({ where: { id } });
  }
}
