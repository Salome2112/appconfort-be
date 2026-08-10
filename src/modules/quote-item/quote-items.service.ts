// src/quote-items/quote-items.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, QuoteStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';
import { round2 } from '../../common/money.util';

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class QuoteItemsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ──────────────────────────────────────────────

  /** Verifica que la cotización exista y esté editable (DRAFT). */
  private async getEditableQuote(tx: Tx, quoteId: number) {
    const quote = await tx.quote.findUnique({ where: { id: quoteId } });
    if (!quote) {
      throw new NotFoundException(`Cotización con id ${quoteId} no encontrada`);
    }
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new ConflictException(
        `No se pueden modificar los ítems: la cotización está en estado ${quote.status}`,
      );
    }
    return quote;
  }

  /**
   * Recalcula subtotal, discountAmount, taxAmount y total del Quote padre
   * a partir de sus QuoteItem actuales, preservando el % de descuento
   * global y el % de impuesto ya vigentes en la cotización.
   */
  private async recalculateQuote(tx: Tx, quoteId: number) {
    const quote = await tx.quote.findUniqueOrThrow({ where: { id: quoteId } });
    const items = await tx.quoteItem.findMany({ where: { quoteId } });

    const subtotal = round2(
      items.reduce((sum, i) => sum + Number(i.subtotal), 0),
    );
    const discountPercent = Number(quote.discountPercent);
    const discountAmount = round2(subtotal * (discountPercent / 100));

    const taxableBefore = Number(quote.subtotal) - Number(quote.discountAmount);
    const taxPercent =
      taxableBefore > 0
        ? round2((Number(quote.taxAmount) / taxableBefore) * 100)
        : 0;

    const taxable = subtotal - discountAmount;
    const taxAmount = round2(taxable * (taxPercent / 100));
    const total = round2(taxable + taxAmount);

    return tx.quote.update({
      where: { id: quoteId },
      data: { subtotal, discountAmount, taxAmount, total },
    });
  }

  // ── CRUD ─────────────────────────────────────────────────

  findAllByQuote(quoteId: number) {
    return this.prisma.quoteItem.findMany({
      where: { quoteId },
      include: { product: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(quoteId: number, id: number) {
    const item = await this.prisma.quoteItem.findFirst({
      where: { id, quoteId },
      include: { product: true },
    });
    if (!item) {
      throw new NotFoundException(
        `Ítem ${id} no encontrado en la cotización ${quoteId}`,
      );
    }
    return item;
  }

  async create(quoteId: number, dto: CreateQuoteItemDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.getEditableQuote(tx, quoteId);

      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new BadRequestException(
          `Producto con id ${dto.productId} no encontrado`,
        );
      }

      const quantity = dto.quantity ?? 1;
      const unitPrice = dto.unitPrice ?? Number(product.finalPrice);
      const discountPercent = dto.discountPercent ?? 0;
      const subtotal = round2(
        unitPrice * quantity * (1 - discountPercent / 100),
      );

      let sortOrder = dto.sortOrder;
      if (sortOrder === undefined) {
        const last = await tx.quoteItem.findFirst({
          where: { quoteId },
          orderBy: { sortOrder: 'desc' },
        });
        sortOrder = last ? last.sortOrder + 1 : 0;
      }

      const item = await tx.quoteItem.create({
        data: {
          quoteId,
          productId: dto.productId,
          quantity,
          unitPrice,
          discountPercent,
          subtotal,
          customDetails: dto.customDetails,
          sortOrder,
        },
        include: { product: true },
      });

      await this.recalculateQuote(tx, quoteId);
      return item;
    });
  }

  async update(quoteId: number, id: number, dto: UpdateQuoteItemDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.getEditableQuote(tx, quoteId);

      const existing = await tx.quoteItem.findFirst({
        where: { id, quoteId },
      });
      if (!existing) {
        throw new NotFoundException(
          `Ítem ${id} no encontrado en la cotización ${quoteId}`,
        );
      }

      let basePrice = Number(existing.unitPrice);
      if (dto.productId && dto.productId !== existing.productId) {
        const product = await tx.product.findUnique({
          where: { id: dto.productId },
        });
        if (!product) {
          throw new BadRequestException(
            `Producto con id ${dto.productId} no encontrado`,
          );
        }
        basePrice = Number(product.finalPrice);
      }

      const quantity = dto.quantity ?? existing.quantity;
      const unitPrice = dto.unitPrice ?? basePrice;
      const discountPercent =
        dto.discountPercent ?? Number(existing.discountPercent);
      const subtotal = round2(
        unitPrice * quantity * (1 - discountPercent / 100),
      );

      const item = await tx.quoteItem.update({
        where: { id },
        data: {
          productId: dto.productId ?? existing.productId,
          quantity,
          unitPrice,
          discountPercent,
          subtotal,
          customDetails: dto.customDetails ?? existing.customDetails,
          sortOrder: dto.sortOrder ?? existing.sortOrder,
        },
        include: { product: true },
      });

      await this.recalculateQuote(tx, quoteId);
      return item;
    });
  }

  async remove(quoteId: number, id: number) {
    return this.prisma.$transaction(async (tx) => {
      await this.getEditableQuote(tx, quoteId);

      const existing = await tx.quoteItem.findFirst({
        where: { id, quoteId },
      });
      if (!existing) {
        throw new NotFoundException(
          `Ítem ${id} no encontrado en la cotización ${quoteId}`,
        );
      }

      const itemCount = await tx.quoteItem.count({ where: { quoteId } });
      if (itemCount <= 1) {
        throw new ConflictException(
          'No se puede eliminar el último ítem de una cotización',
        );
      }

      await tx.quoteItem.delete({ where: { id } });
      await this.recalculateQuote(tx, quoteId);
      return existing;
    });
  }
}
