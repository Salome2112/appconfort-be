import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';
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

    return this.prisma.product.delete({ where: { id } });
  }

  async updateImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<ProductResponse> {
    // Verifica que el producto exista antes de asociarle la imagen
    await this.findOne(id);

    // Guardamos la URL pública, no la ruta física del disco.
    // Coincide con el prefix '/uploads' que configuramos en main.ts
    const imageUrl = `/uploads/products/${file.filename}`;

    const product = await this.prisma.product.update({
      where: { id },
      data: { imageUrl },
    });

    return toNumber(product);
  }
}
