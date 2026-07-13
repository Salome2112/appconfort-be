// src/quote-items/quote-items.module.ts
import { Module } from '@nestjs/common';
import { QuoteItemsService } from './quote-items.service';
import { QuoteItemsController } from './quote-items.controller';

@Module({
  controllers: [QuoteItemsController],
  providers: [QuoteItemsService],
  exports: [QuoteItemsService],
})
export class QuoteItemsModule {}
