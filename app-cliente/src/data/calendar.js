/* ============================================================
   Constantes de calendário + helpers de disponibilidade.
   Fonte da verdade: /public/:tenant/disponibilidade (backend);
   consumido via hook useDispo. Meses são 0-indexados (padrão Date do JS).
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

/** Cor de cada status na UI. `indisponivel` = dia não declarado na base. */
export const STATUS_COLOR = {
  livre: '#b6e84c',
  parcial: '#f5a623',
  ocupado: '#e23b3b',
  indisponivel: 'rgba(255,255,255,.12)',
};

/** Definição canônica dos slots, alinhada com acl.MAPA_SLOT do backend. */
export const SLOTS_DEF = [
  { label: 'Tarde',     time: '14h às 18h', key: 'tarde' },
  { label: 'Noite',     time: '19h às 23h', key: 'noite' },
  { label: 'Madrugada', time: '23h às 03h', key: 'madrugada' },
];

/** ISO 'YYYY-MM-DD' para (y, m 0-indexed, d). */
export function isoOf(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function hojeUtc() {
  const n = new Date();
  return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
}

/**
 * Status do dia a partir da disponibilidade do backend:
 *   'past' | 'indisponivel' | 'ocupado' | 'parcial' | 'livre'.
 * @param {object} dias  mapa { 'YYYY-MM-DD': { tarde, noite, madrugada } }
 */
export function statusOf(dias, y, m, d) {
  if (Date.UTC(y, m, d) < hojeUtc()) return 'past';
  const info = dias?.[isoOf(y, m, d)];
  if (!info) return 'indisponivel';
  const livres = [info.tarde, info.noite, info.madrugada].filter(Boolean).length;
  if (livres === 0) return 'ocupado';
  if (livres === 3) return 'livre';
  return 'parcial';
}

/**
 * Slots de um dia com `taken` derivado da disponibilidade real.
 * Dia inexistente na base → lista vazia (não há o que oferecer).
 */
export function slotsOfDay(dias, y, m, d) {
  const info = dias?.[isoOf(y, m, d)];
  if (!info) return [];
  return SLOTS_DEF.map((s) => ({ label: s.label, time: s.time, taken: !info[s.key] }));
}
