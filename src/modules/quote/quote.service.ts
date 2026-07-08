import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Quote } from '@prisma/client';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    return this.prisma.quote.create({
      data: createQuoteDto,
    });
  }

  findAll(): Promise<Quote[]> {
    return this.prisma.quote.findMany({
      include: {
        client: true,
        items: true,
      },
    });
  }

  async findOne(id: number): Promise<Quote> {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    await this.findOne(id);

    return this.prisma.quote.update({
      where: { id },
      data: updateQuoteDto,
    });
  }

  async remove(id: number): Promise<Quote> {
    await this.findOne(id);

    return this.prisma.quote.delete({
      where: { id },
    });
  }
}