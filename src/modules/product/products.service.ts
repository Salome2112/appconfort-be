import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { put, del } from '@vercel/blob';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { toNumber } from '../../common/decimal.util';
import { ProductResponse } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ✅ SIN async (retornamos la Promise directamente)
  create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  findAll() {
    return this.prisma.product
      .findMany({ orderBy: { id: 'asc' } })
      .then(toNumber);
  }

  // ✅ CON async (necesitamos await para verificar existencia)
  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  // ✅ SIN async (findUnique retorna null si no existe, comportamiento esperado)
  findBySku(sku: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { sku },
    });
  }

  // ✅ SIN async (solo traemos activos, sin verificación previa)
  findAllActive(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ✅ CON async (verificamos existencia antes de actualizar)
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.findOne(id); // Lanza NotFoundException si no existe

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // ✅ CON async (verificamos existencia antes de eliminar)
  async remove(id: number): Promise<Product> {
    await this.findOne(id); // Lanza NotFoundException si no existe

    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          'No se puede eliminar el producto porque está asociado a cotizaciones existentes.',
        );
      }
      throw error;
    }
  }

  async updateImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<ProductResponse> {
    // Verifica que el producto exista antes de asociarle la imagen
    const existingProduct = await this.findOne(id);

    // Si ya tiene una imagen en Vercel Blob, la eliminamos
    if (existingProduct.imageUrl && existingProduct.imageUrl.includes('public.blob.vercel-storage.com')) {
      try {
        await del(existingProduct.imageUrl);
      } catch (error) {
        console.error('Error deleting old image from Vercel Blob:', error);
      }
    }

    // Subimos la nueva imagen a Vercel Blob
    const blob = await put(`products/${id}-${Date.now()}-${file.originalname}`, file.buffer, {
      access: 'public',
    });

    const product = await this.prisma.product.update({
      where: { id },
      data: { imageUrl: blob.url },
    });

    return toNumber(product);
  }
}
