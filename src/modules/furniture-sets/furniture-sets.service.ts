import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { CreateFurnitureSetDto } from './dto/create-furniture-set.dto';
import { UpdateFurnitureSetDto } from './dto/update-furniture-set.dto';
import { FurnitureSet } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FurnitureSetsService {
  constructor(private prisma: PrismaService) {}

  private async generateSku(): Promise<string> {
    const count = await this.prisma.furnitureSet.count();
    return `SET-${String(count + 1).padStart(4, '0')}`;
  }

  async create(createFurnitureSetDto: CreateFurnitureSetDto): Promise<FurnitureSet> {
    const sku = await this.generateSku();
    
    // Verify that all productIds exist
    const productsCount = await this.prisma.product.count({
      where: { id: { in: createFurnitureSetDto.productIds } },
    });
    if (productsCount !== createFurnitureSetDto.productIds.length) {
      throw new BadRequestException('One or more product IDs are invalid');
    }

    return this.prisma.$transaction(async (tx) => {
      const furnitureSet = await tx.furnitureSet.create({
        data: {
          sku,
          description: createFurnitureSetDto.description || `Furniture Set ${sku}`,
          isActive: true,
        },
      });

      if (createFurnitureSetDto.productIds && createFurnitureSetDto.productIds.length > 0) {
        await tx.setItem.createMany({
          data: createFurnitureSetDto.productIds.map((productId, index) => ({
            furnitureSetId: furnitureSet.id,
            productId,
            quantity: 1,
            sortOrder: index,
          })),
        });
      }

      return tx.furnitureSet.findUnique({
        where: { id: furnitureSet.id },
        include: {
          setItems: {
            include: {
              product: true,
            },
          },
        },
      }) as any;
    });
  }


  findAll(): Promise<FurnitureSet[]> {
    return this.prisma.furnitureSet.findMany({
      include: {
        setItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // ✅ CON async (porque usamos await para verificar existencia)
  async findOne(id: number): Promise<FurnitureSet> {
    const furnitureSet = await this.prisma.furnitureSet.findUnique({
      where: { id },
      include: {
        setItems: {
          include: {
            product: true,
          },
        },
      },
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

    const { productIds, ...updateData } = updateFurnitureSetDto;

    // Si vienen productIds, verificar que existan todos los productos
    if (productIds) {
      const productsCount = await this.prisma.product.count({
        where: { id: { in: productIds } },
      });
      if (productsCount !== productIds.length) {
        throw new BadRequestException('One or more product IDs are invalid');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Actualizar campos propios del set
      await tx.furnitureSet.update({
        where: { id },
        data: updateData,
      });

      // 2. Si vienen productIds, reemplazar las relaciones
      if (productIds) {
        // Eliminar las relaciones previas
        await tx.setItem.deleteMany({
          where: { furnitureSetId: id },
        });

        // Crear las nuevas relaciones
        if (productIds.length > 0) {
          await tx.setItem.createMany({
            data: productIds.map((productId, index) => ({
              furnitureSetId: id,
              productId,
              quantity: 1,
              sortOrder: index,
            })),
          });
        }
      }

      // Devolver el set completo con sus relaciones
      return tx.furnitureSet.findUnique({
        where: { id },
        include: {
          setItems: {
            include: {
              product: true,
            },
          },
        },
      }) as any;
    });
  }

  // ✅ CON async (porque usamos await para verificar existencia)
  async remove(id: number): Promise<FurnitureSet> {
    await this.findOne(id);
    return this.prisma.furnitureSet.delete({ where: { id } });
  }
}
