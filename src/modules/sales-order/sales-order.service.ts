import { Injectable, NotFoundException } from '@nestjs/common';
import { SalesOrder } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

@Injectable()
export class SalesOrderService {
  constructor(private prisma: PrismaService) {}

  // Crear una orden de venta
  create(createSalesOrderDto: CreateSalesOrderDto): Promise<SalesOrder> {
    return this.prisma.salesOrder.create({
      data: {
        number: createSalesOrderDto.number,
        status: createSalesOrderDto.status,
        quoteTotal: createSalesOrderDto.quoteTotal,
        pendingBalance: createSalesOrderDto.pendingBalance,
        orderDate: createSalesOrderDto.orderDate
          ? new Date(createSalesOrderDto.orderDate)
          : undefined,
        agreedDeliveryDate: createSalesOrderDto.agreedDeliveryDate
          ? new Date(createSalesOrderDto.agreedDeliveryDate)
          : undefined,
        actualDeliveryDate: createSalesOrderDto.actualDeliveryDate
          ? new Date(createSalesOrderDto.actualDeliveryDate)
          : undefined,
        notes: createSalesOrderDto.notes,

        quote: {
          connect: {
            id: createSalesOrderDto.quoteId,
          },
        },
      },
    });
  }

  // Obtener todas las órdenes
  findAll(): Promise<SalesOrder[]> {
    return this.prisma.salesOrder.findMany({
      include: {
        quote: true,
        payments: true,
      },
    });
  }

  // Buscar una orden por ID
  async findOne(id: number): Promise<SalesOrder> {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        quote: true,
        payments: true,
      },
    });

    if (!salesOrder) {
      throw new NotFoundException(`SalesOrder with ID ${id} not found`);
    }

    return salesOrder;
  }

  // Actualizar una orden
  async update(
    id: number,
    updateSalesOrderDto: UpdateSalesOrderDto,
  ): Promise<SalesOrder> {
    await this.findOne(id);

    const {
      quoteId,
      orderDate,
      agreedDeliveryDate,
      actualDeliveryDate,
      ...rest
    } = updateSalesOrderDto;

    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        ...rest,

        orderDate: orderDate
        ? new Date(orderDate)
          : undefined,

        agreedDeliveryDate: agreedDeliveryDate
          ? new Date(agreedDeliveryDate)
          : undefined,

        actualDeliveryDate: actualDeliveryDate
          ? new Date(actualDeliveryDate)
          : undefined,

        quote: quoteId
          ? {
              connect: {
                id: quoteId,
              },
            }
          : undefined,
      },
    });
  }

  // Eliminar una orden
  async remove(id: number): Promise<SalesOrder> {
    await this.findOne(id);

    return this.prisma.salesOrder.delete({
      where: { id },
    });
  }
}