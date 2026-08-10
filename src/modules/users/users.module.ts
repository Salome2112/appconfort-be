// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // Se exporta para que AuthModule pueda inyectar UsersService
  // y usar findByEmailWithPassword() en el login.
  exports: [UsersService],
})
export class UsersModule {}
