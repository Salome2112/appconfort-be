// src/modules/furniture-sets/furniture-sets.controller.ts
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
import { FurnitureSetsService } from './furniture-sets.service';
import { CreateFurnitureSetDto } from './dto/create-furniture-set.dto';
import { UpdateFurnitureSetDto } from './dto/update-furniture-set.dto';
import { FurnitureSet } from '@prisma/client';

@Controller('furniture-sets') // ← Equivalente a @RequestMapping
export class FurnitureSetsController {
  // Inyección del servicio
  constructor(private readonly furnitureSetsService: FurnitureSetsService) {}

  @Post() // ← Equivalente a @PostMapping
  create(
    @Body() createFurnitureSetDto: CreateFurnitureSetDto,
  ): Promise<FurnitureSet> {
    return this.furnitureSetsService.create(createFurnitureSetDto);
  }

  @Get() // ← Equivalente a @GetMapping
  findAll(): Promise<FurnitureSet[]> {
    return this.furnitureSetsService.findAll();
  }

  @Get(':id') // ← Equivalente a @GetMapping("/{id}")
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FurnitureSet> {
    return this.furnitureSetsService.findOne(id);
  }

  @Put(':id') // ← Equivalente a @PutMapping("/{id}")
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFurnitureSetDto: UpdateFurnitureSetDto,
  ): Promise<FurnitureSet> {
    return this.furnitureSetsService.update(id, updateFurnitureSetDto);
  }

  @Delete(':id') // ← Equivalente a @DeleteMapping("/{id}")
  @HttpCode(HttpStatus.NO_CONTENT) // ← Equivalente a @ResponseStatus(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.furnitureSetsService.remove(id);
    return Promise.resolve();
  }
}
