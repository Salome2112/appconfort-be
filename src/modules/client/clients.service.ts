import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  // ✅ SIN async (no usamos await, retornamos la Promise directamente)
  create(createClientDto: CreateClientDto): Promise<Client> {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  // ✅ SIN async (no usamos await, retornamos la Promise directamente)
  findAll(): Promise<Client[]> {
    return this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ CON async (usamos await para verificar existencia)
  async findOne(id: number): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  // ✅ SIN async (no necesitamos await, findOne ya lanza el error si no existe)
  findByNui(nui: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { nui },
    });
  }

  // ✅ CON async (usamos await para verificar existencia antes de actualizar)
  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    await this.findOne(id); // Lanza NotFoundException si no existe

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  // ✅ CON async (usamos await para verificar existencia antes de eliminar)
  async remove(id: number): Promise<Client> {
    await this.findOne(id); // Lanza NotFoundException si no existe

    return this.prisma.client.delete({ where: { id } });
  }
}
