// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(150)
  email: string;

  // Contraseña en texto plano SOLO en este DTO de entrada.
  // Se hashea en el service antes de tocar la base de datos.
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: `role debe ser uno de: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;
}
