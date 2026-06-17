// src/modules/furniture-sets/furniture-sets.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateFurnitureSetDto } from './dto/create-furniture-set.dto';
import { UpdateFurnitureSetDto } from './dto/update-furniture-set.dto';
import { FurnitureSet } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FurnitureSetsService {
  constructor(private prisma: PrismaService) {}

  // ✅ SIN async (porque no usamos await)
  create(createFurnitureSetDto: CreateFurnitureSetDto): Promise<FurnitureSet> {
    return this.prisma.furnitureSet.create({
      data: createFurnitureSetDto,
    });
  }


  findAll(): Promise<FurnitureSet[]> {
    return this.prisma.furnitureSet.findMany(); // ← Directo
  }

  // ✅ CON async (porque usamos await para verificar existencia)
  async findOne(id: number): Promise<FurnitureSet> {
    const furnitureSet = await this.prisma.furnitureSet.findUnique({
      where: { id },
    });

    if (!furnitureSet) {
      throw new NotFoundException(`FurnitureSet with ID ${id} not found`);
    }

    return furnitureSet;
  }

  // ✅ CON async (porque usamos await para verificar existencia)
  async update(
    id: number,
    updateFurnitureSetDto: UpdateFurnitureSetDto,
  ): Promise<FurnitureSet> {
    await this.findOne(id); // Verificar que existe

    return this.prisma.furnitureSet.update({
      where: { id },
      data: updateFurnitureSetDto,
    });
  }

  // ✅ CON async (porque usamos await para verificar existencia)
  async remove(id: number): Promise<FurnitureSet> {
    await this.findOne(id);
    return this.prisma.furnitureSet.delete({ where: { id } });
  }
}
