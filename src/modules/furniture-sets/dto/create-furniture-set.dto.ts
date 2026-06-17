import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFurnitureSetDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
