import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService], // ← Útil si Quotes u otros módulos necesitan ClientsService
})
export class ClientsModule {}
