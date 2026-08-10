// src/sales-orders/dto/update-sales-order.dto.ts
import { IsOptional, IsDateString, IsString } from 'class-validator';

// La SalesOrder no se crea manualmente (nace de un Quote aceptado),
// por eso no existe CreateSalesOrderDto expuesto al cliente.
// Solo estos campos son editables a mano; los montos son derivados.
export class UpdateSalesOrderDto {
  @IsOptional()
  @IsDateString()
  agreedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
