import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';

import { SetItemsService } from './set-items.service';
import { CreateSetItemDto } from './dto/create-set-item.dto';
import { UpdateSetItemDto } from './dto/update-set-item.dto';

@Controller('set-items')
export class SetItemsController {
  constructor(private readonly setItemsService: SetItemsService) {}

  @Post()
  create(@Body() createSetItemDto: CreateSetItemDto) {
    return this.setItemsService.create(createSetItemDto);
  }

  @Get()
  findAll() {
    return this.setItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.setItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSetItemDto: UpdateSetItemDto,
  ) {
    return this.setItemsService.update(id, updateSetItemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.setItemsService.remove(id);
  }
}