// src/common/money.util.ts

// Redondeo a 2 decimales evitando errores de coma flotante.
// Reutilizado por QuotesService y QuoteItemsService para que
// ambos calculen los montos exactamente de la misma forma.
export const round2 = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;
