import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSetItemDto } from './dto/create-set-item.dto';
import { UpdateSetItemDto } from './dto/update-set-item.dto';
import { SetItem } from '@prisma/client';

@Injectable()
export class SetItemsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkSetExists(furnitureSetId: number) {
    const exists = await this.prisma.furnitureSet.findUnique({
      where: { id: furnitureSetId },
    });
    if (!exists) {
      throw new NotFoundException(`FurnitureSet with ID ${furnitureSetId} not found`);
    }
  }

  async create(furnitureSetId: number, dto: CreateSetItemDto): Promise<SetItem> {
    await this.checkSetExists(furnitureSetId);

    const productExists = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!productExists) {
      throw new BadRequestException(`Product with ID ${dto.productId} not found`);
    }

    // Check if the item already exists in the set
    const existing = await this.prisma.setItem.findUnique({
      where: {
        furnitureSetId_productId: {
          furnitureSetId,
          productId: dto.productId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`Product ID ${dto.productId} is already in the furniture set`);
    }

    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const last = await this.prisma.setItem.findFirst({
        where: { furnitureSetId },
        orderBy: { sortOrder: 'desc' },
      });
      sortOrder = last ? last.sortOrder + 1 : 0;
    }

    return this.prisma.setItem.create({
      data: {
        furnitureSetId,
        productId: dto.productId,
        quantity: dto.quantity ?? 1,
        sortOrder,
      },
      include: { product: true },
    });
  }

  async findAllBySet(furnitureSetId: number): Promise<SetItem[]> {
    await this.checkSetExists(furnitureSetId);
    return this.prisma.setItem.findMany({
      where: { furnitureSetId },
      include: { product: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(furnitureSetId: number, id: number): Promise<SetItem> {
    const item = await this.prisma.setItem.findFirst({
      where: { id, furnitureSetId },
      include: { product: true },
    });
    if (!item) {
      throw new NotFoundException(`SetItem with ID ${id} not found in FurnitureSet ${furnitureSetId}`);
    }
    return item;
  }

  async update(
    furnitureSetId: number,
    id: number,
    dto: UpdateSetItemDto,
  ): Promise<SetItem> {
    const existing = await this.findOne(furnitureSetId, id);

    if (dto.productId && dto.productId !== existing.productId) {
      const productExists = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!productExists) {
        throw new BadRequestException(`Product with ID ${dto.productId} not found`);
      }

      // Check unique constraint
      const dup = await this.prisma.setItem.findUnique({
        where: {
          furnitureSetId_productId: {
            furnitureSetId,
            productId: dto.productId,
          },
        },
      });
      if (dup && dup.id !== id) {
        throw new ConflictException(`Product ID ${dto.productId} is already in the furniture set`);
      }
    }

    return this.prisma.setItem.update({
      where: { id },
      data: {
        productId: dto.productId,
        quantity: dto.quantity,
        sortOrder: dto.sortOrder,
      },
      include: { product: true },
    });
  }

  async remove(furnitureSetId: number, id: number): Promise<SetItem> {
    await this.findOne(furnitureSetId, id);
    return this.prisma.setItem.delete({
      where: { id },
    });
  }
}
