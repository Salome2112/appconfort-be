import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FurnitureSetsModule } from './modules/furniture-sets/furniture-sets.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './modules/products/products.module';
import { ClientModule } from './modules/client/client.module';
import { SetItemsModule } from './modules/set-items/set-items.module';
import { QuoteModule } from './modules/quote/quote.module';
import { QuoteItemsModule } from './modules/quote-items/quote-items.module';
import { SalesOrderModule } from './modules/sales-order/sales-order.module';
import { PaymentModule } from './modules/payment/payment.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que cargue el .env inmediatamente en todo el proyecto
    }),
    PrismaModule,
    FurnitureSetsModule,
    ProductsModule,
    ClientModule,
    SetItemsModule,
    QuoteModule,
    QuoteItemsModule,
    SalesOrderModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
