// src/modules/furniture-sets/dto/update-furniture-set.dto.ts

import { CreateFurnitureSetDto } from './create-furniture-set.dto';
import { IsOptional, IsArray, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

/**
 * DTO para actualizar un conjunto de muebles
 *
 * Extiende de CreateFurnitureSetDto pero todos los campos son opcionales
 * Esto permite actualizar solo los campos que se envían
 */
export class UpdateFurnitureSetDto extends PartialType(CreateFurnitureSetDto) {
  /**
   * Lista de IDs de productos para asociar al conjunto
   * Si se envía, reemplaza todos los productos existentes
   */
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  productIds?: number[];
}
