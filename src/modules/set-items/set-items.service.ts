import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateSetItemDto } from './dto/create-set-item.dto';
import { UpdateSetItemDto } from './dto/update-set-item.dto';

import { SetItem } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SetItemsService {
  constructor(private prisma: PrismaService) {}

  // Crear
  create(createSetItemDto: CreateSetItemDto): Promise<SetItem> {
    return this.prisma.setItem.create({
      data: createSetItemDto,
    });
  }

  // Obtener todos
  findAll(): Promise<SetItem[]> {
    return this.prisma.setItem.findMany();
  }

  // Obtener uno
  async findOne(id: number): Promise<SetItem> {
    const setItem = await this.prisma.setItem.findUnique({
      where: { id },
    });

    if (!setItem) {
      throw new NotFoundException(`SetItem with ID ${id} not found`);
    }

    return setItem;
  }

  // Actualizar
  async update(
    id: number,
    updateSetItemDto: UpdateSetItemDto,
  ): Promise<SetItem> {
    await this.findOne(id);

    return this.prisma.setItem.update({
      where: { id },
      data: updateSetItemDto,
    });
  }

  // Eliminar
  async remove(id: number): Promise<SetItem> {
    await this.findOne(id);

    return this.prisma.setItem.delete({
      where: { id },
    });
  }
}