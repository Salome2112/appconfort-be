import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateSetItemDto {
  @IsInt()
  productId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
