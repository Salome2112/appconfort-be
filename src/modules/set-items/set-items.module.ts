import { Module } from '@nestjs/common';
import { SetItemsController } from './set-items.controller';
import { SetItemsService } from './set-items.service';

@Module({
  controllers: [SetItemsController],
  providers: [SetItemsService],
})
export class SetItemsModule {}
