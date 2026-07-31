// src/users/dto/user-response.dto.ts
import { User as PrismaUser } from '@prisma/client';

// Nunca se devuelve el hash de la contraseña al cliente.
export type UserResponse = Omit<PrismaUser, 'password'>;
