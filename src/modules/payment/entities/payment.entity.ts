import { PaymentMethod } from '@prisma/client';

export class PaymentEntity {
  id: number;
  salesOrderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}