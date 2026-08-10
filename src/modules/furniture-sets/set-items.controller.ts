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
import { SetItemsService } from './set-items.service';
import { CreateSetItemDto } from './dto/create-set-item.dto';
import { UpdateSetItemDto } from './dto/update-set-item.dto';
import { SetItem } from '@prisma/client';

@Controller('furniture-sets/:furnitureSetId/items')
export class SetItemsController {
  constructor(private readonly setItemsService: SetItemsService) {}

  @Post()
  create(
    @Param('furnitureSetId', ParseIntPipe) furnitureSetId: number,
    @Body() dto: CreateSetItemDto,
  ): Promise<SetItem> {
    return this.setItemsService.create(furnitureSetId, dto);
  }

  @Get()
  findAll(
    @Param('furnitureSetId', ParseIntPipe) furnitureSetId: number,
  ): Promise<SetItem[]> {
    return this.setItemsService.findAllBySet(furnitureSetId);
  }

  @Get(':id')
  findOne(
    @Param('furnitureSetId', ParseIntPipe) furnitureSetId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SetItem> {
    return this.setItemsService.findOne(furnitureSetId, id);
  }

  @Put(':id')
  update(
    @Param('furnitureSetId', ParseIntPipe) furnitureSetId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSetItemDto,
  ): Promise<SetItem> {
    return this.setItemsService.update(furnitureSetId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('furnitureSetId', ParseIntPipe) furnitureSetId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    this.setItemsService.remove(furnitureSetId, id);
    return Promise.resolve();
  }
}
