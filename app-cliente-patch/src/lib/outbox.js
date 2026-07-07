/* ============================================================
   Outbox offline — buffer local de mutações (pedido/evento).

   Quando a rede cai no trailer, a mutação NÃO se perde: vai para uma fila em
   localStorage com sua chave de idempotência. Ao voltar a conexão (evento
   'online' ou polling periódico), a fila é drenada. Como cada item carrega a
   mesma X-Idempotency-Key, o reenvio é seguro — o servidor deduplica.

   Isto realiza o axioma "buffers locais para tolerar perda de conexão".
   ============================================================ */

import { api } from './api.js';

const KEY = 'sd_outbox';

function ler() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function gravar(lista) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lista));
  } catch {
    /* quota */
  }
}

/** Enfileira uma mutação. entry: { id(idemKey), kind:'pedido'|'evento', payload }. */
export function enfileirar(entry) {
  const lista = ler();
  if (!lista.some((e) => e.id === entry.id)) {
    lista.push({ ...entry, criadoEm: Date.now() });
    gravar(lista);
  }
}

export function pendentes() {
  return ler();
}

export function remover(id) {
  gravar(ler().filter((e) => e.id !== id));
}

let drenando = false;

/**
 * Tenta reenviar tudo. Chama os callbacks conforme o resultado.
 * @param {object} cb { onEnviado(entry, resultado), onDescartado(entry, erro) }
 */
export async function drenar(cb = {}) {
  if (drenando) return;
  drenando = true;
  try {
    for (const entry of ler()) {
      try {
        const resultado =
          entry.kind === 'pedido'
            ? await api.criarPedido(entry.payload, entry.id)
            : await api.criarEvento(entry.payload, entry.id);
        remover(entry.id);
        cb.onEnviado?.(entry, resultado);
      } catch (err) {
        // 4xx (permanente) → descarta para não travar a fila; rede/5xx → mantém.
        if (err && err.status >= 400 && err.status < 500 && err.status !== 429) {
          remover(entry.id);
          cb.onDescartado?.(entry, err);
        } else {
          break; // rede ainda ruim: para e tenta na próxima rodada
        }
      }
    }
  } finally {
    drenando = false;
  }
}

/** Liga a drenagem automática (retorna função de limpeza). */
export function autoDrenar(cb, intervaloMs = 20000) {
  const tick = () => {
    if (navigator.onLine !== false) drenar(cb);
  };
  window.addEventListener('online', tick);
  const timer = setInterval(tick, intervaloMs);
  tick();
  return () => {
    window.removeEventListener('online', tick);
    clearInterval(timer);
  };
}
