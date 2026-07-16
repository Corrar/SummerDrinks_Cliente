/* ============================================================
   Helpers de horário: derivar Aberto/Fechado e formatar horários
   a partir do array retornado por /public/:tenant/config.
   ============================================================ */

// getDay() do JS retorna 0=Dom..6=Sáb. Mapa é usado para casar `dia`/`curto` do backend.
// Aceitamos várias grafias (Segunda/Seg/Seg.) para não travar por variação vinda da gestão.
const DIA_POR_INDICE = [
  { pt: 'Domingo',       curto: 'Dom' },
  { pt: 'Segunda-feira', curto: 'Seg' },
  { pt: 'Terça-feira',   curto: 'Ter' },
  { pt: 'Quarta-feira',  curto: 'Qua' },
  { pt: 'Quinta-feira',  curto: 'Qui' },
  { pt: 'Sexta-feira',   curto: 'Sex' },
  { pt: 'Sábado',        curto: 'Sáb' },
];

/** Normaliza uma string (lower, sem acento, sem espaço) para comparar dia. */
function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s.\-_]/g, '');
}

/**
 * Localiza o horário do dia corrente no array de horarios.
 * Casa por `dia` OU por `curto` (independente de acento/case/pontuação).
 * Retorna undefined se não achar.
 */
export function horarioDoDia(horarios, diaSemana) {
  if (!Array.isArray(horarios)) return undefined;
  const def = DIA_POR_INDICE[diaSemana];
  if (!def) return undefined;
  const alvos = new Set([norm(def.pt), norm(def.curto), norm(def.pt.replace('-feira', ''))]);
  return horarios.find((h) => alvos.has(norm(h?.dia)) || alvos.has(norm(h?.curto)));
}

function minutosDeHora(hhmm) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm ?? ''));
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Está aberto agora?
 *  - Regra padrão: dia atual, se aberto e agora dentro de [abre, fecha).
 *  - Se fecha < abre, o horário atravessa a meia-noite (ex.: abre 18h, fecha 02h):
 *    considera aberto tanto no fim do dia (>= abre) quanto na madrugada do dia
 *    seguinte (< fecha) — este segundo caso é lido consultando o horário de ontem.
 *  - Sem horarios → retorna `fallback` (útil enquanto o config ainda carrega).
 */
export function estaAberto(horarios, agora = new Date(), fallback = false) {
  if (!Array.isArray(horarios) || !horarios.length) return fallback;
  const diaHoje = agora.getDay();
  const diaOntem = (diaHoje + 6) % 7;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const hoje = horarioDoDia(horarios, diaHoje);
  const ontem = horarioDoDia(horarios, diaOntem);

  // Aberto atravessando meia-noite herdado de ontem?
  if (ontem && ontem.aberto) {
    const abre = minutosDeHora(ontem.abre);
    const fecha = minutosDeHora(ontem.fecha);
    if (abre != null && fecha != null && fecha < abre && minutosAgora < fecha) return true;
  }

  if (!hoje || !hoje.aberto) return false;
  const abre = minutosDeHora(hoje.abre);
  const fecha = minutosDeHora(hoje.fecha);
  if (abre == null || fecha == null) return false;
  if (fecha >= abre) return minutosAgora >= abre && minutosAgora < fecha;
  // Horário do próprio dia atravessa a meia-noite → estamos na parte noturna dele.
  return minutosAgora >= abre;
}

/**
 * Formata um horário para "18h às 02h" (omitindo :00 e prefixando com "h").
 * "18:00" → "18h", "02:30" → "02h30".
 */
export function formatarHora(hhmm) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm ?? ''));
  if (!m) return String(hhmm ?? '');
  const h = m[1];
  const min = m[2];
  return min === '00' ? `${h}h` : `${h}h${min}`;
}

/** Rótulo curto para o horário do dia: "18h às 02h" | "Fechado" | ''. */
export function rotuloHorario(h) {
  if (!h) return '';
  if (!h.aberto) return 'Fechado';
  return `${formatarHora(h.abre)} às ${formatarHora(h.fecha)}`;
}
