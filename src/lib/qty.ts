// Utilitários de quantidade para regra B2B:
// toda quantidade deve ser MÚLTIPLA da quantidade mínima (minQty),
// e nunca menor que a mínima.

/**
 * Arredonda PARA CIMA para o próximo múltiplo de `step`.
 * Garante valor >= step. Usado quando o cliente pede uma quantidade que
 * não respeita a regra B2B — preferimos entregar um pouco mais do que menos.
 */
export const roundUpToMultiple = (qty: number, step: number): number => {
  const s = Math.max(1, Math.floor(step));
  const q = Math.max(1, Math.floor(Number(qty) || 0));
  if (q <= s) return s;
  const remainder = q % s;
  if (remainder === 0) return q;
  return q + (s - remainder);
};

/**
 * Verifica se a quantidade respeita a regra (>= mínima E múltipla).
 */
export const isValidQty = (qty: number, step: number): boolean => {
  const s = Math.max(1, Math.floor(step));
  const q = Math.floor(Number(qty) || 0);
  return q >= s && q % s === 0;
};
