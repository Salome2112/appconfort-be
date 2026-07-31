// src/users/dto/update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// La contraseña NO se actualiza por este endpoint genérico.
// Un cambio de contraseña merece su propio endpoint (con validación
// de la contraseña actual) — lo agregamos más adelante si lo necesitas.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}
