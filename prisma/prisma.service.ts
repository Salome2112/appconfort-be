// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Obtener la URL de conexión
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // 2. Crear el pool de conexiones PostgreSQL
    const pool = new Pool({
      connectionString,
      // Opcional: Configuraciones adicionales del pool
      max: 20, // Número máximo de clientes en el pool
      idleTimeoutMillis: 30000, // Tiempo de espera para cerrar conexiones inactivas
    });

    // 3. Crear el adaptador de Prisma
    const adapter = new PrismaPg(pool);

    // 4. Configurar PrismaClient con el adaptador
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
