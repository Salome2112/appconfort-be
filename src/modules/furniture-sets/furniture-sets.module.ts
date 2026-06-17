// src/modules/furniture-sets/furniture-sets.module.ts
import { Module } from '@nestjs/common';
import { FurnitureSetsController } from './furniture-sets.controller';
import { FurnitureSetsService } from './furniture-sets.service';

@Module({
  controllers: [FurnitureSetsController], // ← Registra el controlador
  providers: [FurnitureSetsService], // ← Registra el servicio (inyectable)
  exports: [FurnitureSetsService], // ← Permite usar este servicio en otros módulos
})
export class FurnitureSetsModule {}
