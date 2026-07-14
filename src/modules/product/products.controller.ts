import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';
import { ProductResponse } from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(): Promise<ProductResponse[]> {
    return this.productsService.findAll();
  }

  // ⚠️ Rutas estáticas ANTES que las dinámicas (:id)
  @Get('active')
  findAllActive(): Promise<Product[]> {
    return this.productsService.findAllActive();
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string): Promise<Product | null> {
    return this.productsService.findBySku(sku);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.productsService.remove(id);
    return Promise.resolve();
  }
}
