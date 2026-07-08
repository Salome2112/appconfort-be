import { Module } from '@nestjs/common';
import { QuoteItemsService } from './quote-items.service';
import { QuoteItemsController } from './quote-items.controller';

@Module({
  providers: [QuoteItemsService],
  controllers: [QuoteItemsController],
})
export class QuoteItemsModule {}
