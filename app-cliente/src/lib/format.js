/** Formata um número como moeda brasileira: 25 -> "R$ 25,00". */
export function brl(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
}

/** Formata o horário de um pedido: "Hoje · 14:32" ou "05/07 · 14:32". */
export function formatOrderTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const sameDay = d.toDateString() === now.toDateString();
  const day = sameDay
    ? 'Hoje'
    : String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  return day + ' · ' + hh + ':' + mm;
}
