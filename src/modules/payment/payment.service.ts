import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // Crear un pago
  create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.prisma.payment.create({
      data: createPaymentDto,
    });
  }

  // Obtener todos los pagos
  findAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      include: {
        salesOrder: true,
      },
    });
  }

  // Obtener un pago por ID
  async findOne(id: number): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        salesOrder: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  // Actualizar un pago
  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    await this.findOne(id);

    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  // Eliminar un pago
  async remove(id: number): Promise<Payment> {
    await this.findOne(id);

    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
