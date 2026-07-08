import { Module } from '@nestjs/common';
import { QuotesController } from './quote.controller';
import { QuotesService } from './quote.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, PrismaService],
})
export class QuoteModule {}