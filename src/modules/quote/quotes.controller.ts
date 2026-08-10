import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}


  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuoteDto) {
    return this.quotesService.update(id, dto);
  }

  // ── Transiciones de estado ──────────────────────────────

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  send(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.send(id);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.accept(id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.reject(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.cancel(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.remove(id);
  }

  @Post(':id/upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ pdfUrl: string }> {
    const { put } = await import('@vercel/blob');
    const blob = await put(`proformas/proforma-${id}-${Date.now()}.pdf`, file.buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    return { pdfUrl: blob.url };
  }
}

