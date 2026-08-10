// src/quote-items/quote-items.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { QuoteItemsService } from './quote-items.service';
import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';

// Recurso anidado: los ítems siempre viven dentro de una cotización
@Controller('quotes/:quoteId/items')
export class QuoteItemsController {
  constructor(private readonly quoteItemsService: QuoteItemsService) {}

  @Post()
  create(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Body() dto: CreateQuoteItemDto,
  ) {
    return this.quoteItemsService.create(quoteId, dto);
  }

  @Get()
  findAll(@Param('quoteId', ParseIntPipe) quoteId: number) {
    return this.quoteItemsService.findAllByQuote(quoteId);
  }

  @Get(':id')
  findOne(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quoteItemsService.findOne(quoteId, id);
  }

  @Put(':id')
  update(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuoteItemDto,
  ) {
    return this.quoteItemsService.update(quoteId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('quoteId', ParseIntPipe) quoteId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quoteItemsService.remove(quoteId, id);
  }
}
