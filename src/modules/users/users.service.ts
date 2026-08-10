// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './dto/user-response.dto';

const SALT_ROUNDS = 10;

// Quita "password" del objeto antes de devolverlo al cliente.
// No usamos toNumber aquí: User no tiene campos Decimal.
function toResponse(user: {
  password: string;
  [k: string]: any;
}): UserResponse {
  const { password, ...rest } = user;
  return rest as UserResponse;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role, // si viene undefined, aplica el @default(SALES) del schema
        },
      });
      return toResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe un usuario registrado con el email "${dto.email}"`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany({ orderBy: { id: 'asc' } });
    return users.map(toResponse);
  }

  async findOne(id: number): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return toResponse(user);
  }

  // Usado internamente por AuthService — SÍ incluye el password hasheado,
  // porque hay que compararlo contra el ingresado en el login.
  findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponse> {
    await this.findOne(id);
    try {
      const user = await this.prisma.user.update({ where: { id }, data: dto });
      return toResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Ya existe un usuario registrado con el email "${dto.email}"`,
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<UserResponse> {
    await this.findOne(id);
    const user = await this.prisma.user.delete({ where: { id } });
    return toResponse(user);
  }
}
