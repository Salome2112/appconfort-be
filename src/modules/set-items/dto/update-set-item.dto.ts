import { PartialType } from '@nestjs/mapped-types';
import { CreateSetItemDto } from './create-set-item.dto';

export class UpdateSetItemDto extends PartialType(CreateSetItemDto) {}