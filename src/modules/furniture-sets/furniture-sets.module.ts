// src/modules/furniture-sets/furniture-sets.module.ts
import { Module } from '@nestjs/common';
import { FurnitureSetsController } from './furniture-sets.controller';
import { FurnitureSetsService } from './furniture-sets.service';
import { SetItemsController } from './set-items.controller';
import { SetItemsService } from './set-items.service';

@Module({
  controllers: [FurnitureSetsController, SetItemsController], // ← Registra los controladores
  providers: [FurnitureSetsService, SetItemsService], // ← Registra los servicios (inyectables)
  exports: [FurnitureSetsService, SetItemsService], // ← Permite usar estos servicios en otros módulos
})
export class FurnitureSetsModule {}
