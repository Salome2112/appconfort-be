import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FurnitureSetsModule } from './modules/furniture-sets/furniture-sets.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que cargue el .env inmediatamente en todo el proyecto
    }),
    PrismaModule,
    FurnitureSetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
