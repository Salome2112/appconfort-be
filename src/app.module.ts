import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FurnitureSetsModule } from './modules/furniture-sets/furniture-sets.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from './modules/client/clients.module';
import { ProductsModule } from './modules/product/products.module';
import { QuotesModule } from './modules/quote/quotes.module';
import { QuoteItemsModule } from './modules/quote-item/quote-items.module';
import { SalesOrdersModule } from './modules/sales-order/sales-orders.module';
import { PaymentsModule } from './modules/payment/payments.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que cargue el .env inmediatamente en todo el proyecto
    }),
    PrismaModule,
    FurnitureSetsModule,
    ClientsModule, // ← Agregado
    ProductsModule,
    QuotesModule,
    QuoteItemsModule,
    SalesOrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
