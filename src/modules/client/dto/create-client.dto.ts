import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @Length(5, 20)
  nui: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}