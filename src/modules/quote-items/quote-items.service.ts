import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuoteItem } from '@prisma/client';
import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';

@Injectable()
export class QuoteItemsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateQuoteItemDto): Promise<QuoteItem> {
    return this.prisma.quoteItem.create({
      data: dto,
    });
  }

  findAll(): Promise<QuoteItem[]> {
    return this.prisma.quoteItem.findMany({
      include: {
        product: true,
        quote: true,
      },
    });
  }

  async findOne(id: number): Promise<QuoteItem> {
    const item = await this.prisma.quoteItem.findUnique({
      where: { id },
      include: {
        product: true,
        quote: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`QuoteItem with ID ${id} not found`);
    }

    return item;
  }
  async update(
    id: number,
    dto: UpdateQuoteItemDto,
  ): Promise<QuoteItem> {
    await this.findOne(id);

    return this.prisma.quoteItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number): Promise<QuoteItem> {
    await this.findOne(id);

    return this.prisma.quoteItem.delete({
      where: { id },
    });
  }
}