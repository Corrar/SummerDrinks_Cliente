/* ============================================================
   Agenda de eventos — disponibilidade do trailer.
   Datas ocupadas / parciais são mockadas; em produção viriam
   de uma API. Meses são 0-indexados (padrão do Date do JS).
   ============================================================ */

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const MESES_ABR = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

export const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** Dias totalmente ocupados, por chave "ano-mês". */
export const OCUPADO = { '2026-5': [27, 28], '2026-6': [4, 11, 18, 25] };

/** Dias parcialmente ocupados (algum horário livre). */
export const PARCIAL = { '2026-5': [25, 26, 30], '2026-6': [3, 5, 12, 19, 26] };

/** Data de referência (hoje) usada para bloquear datas passadas. */
export const TODAY = { y: 2026, m: 5, d: 24 };

/** Cor de cada status de disponibilidade. */
export const STATUS_COLOR = { livre: '#b6e84c', parcial: '#f5a623', ocupado: '#e23b3b' };

/**
 * Retorna o status de uma data:
 * 'past' | 'ocupado' | 'parcial' | 'livre'.
 */
export function statusOf(y, m, d) {
  const ts = Date.UTC(y, m, d);
  const today = Date.UTC(TODAY.y, TODAY.m, TODAY.d);
  if (ts < today) return 'past';
  const key = y + '-' + m;
  if ((OCUPADO[key] || []).includes(d)) return 'ocupado';
  if ((PARCIAL[key] || []).includes(d)) return 'parcial';
  return 'livre';
}
