import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateSetItemDto {
  @IsInt()
  @IsNotEmpty()
  furnitureSetId: number;

  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}