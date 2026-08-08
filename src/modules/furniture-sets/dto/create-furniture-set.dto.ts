import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFurnitureSetDto {
  @IsArray()
  @IsNumber({}, { each: true })
  productIds: number[];

  @IsOptional()
  @IsString()
  description?: string;
}
