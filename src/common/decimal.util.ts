// src/common/decimal.util.ts
import { Prisma } from '@prisma/client';

export function toNumber<T>(value: T): DecimalToNumber<T> {
  if (value instanceof Prisma.Decimal) return Number(value) as any;

  // Date debe tratarse como valor atómico, igual que Decimal —
  // si no, Object.entries(date) lo desarma en {} porque sus
  // propiedades (getFullYear, etc.) viven en el prototipo, no
  // como propiedades propias enumerables.
  if (value instanceof Date) return value as any;

  if (Array.isArray(value)) return value.map(toNumber) as any;

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, toNumber(v)]),
    ) as any;
  }

  return value as any;
}

type DecimalToNumber<T> = T extends Prisma.Decimal
  ? number
  : T extends Date
    ? Date
    : T extends (infer U)[]
      ? DecimalToNumber<U>[]
      : T extends object
        ? { [K in keyof T]: DecimalToNumber<T[K]> }
        : T;
