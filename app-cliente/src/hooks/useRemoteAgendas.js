import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { loadJSON, saveJSON } from '../lib/storage.js';
import { AGENDA_TERMINAIS } from './useAgenda.js';

const AGENDAS_KEY = 'sd_agendas';
const AGENDAS_SEEN_KEY = 'sd_agendas_seen';
const POLL_MS = 20000;

/**
 * Coleção persistente de solicitações de evento enviadas pelo cliente.
 * Espelha a disciplina de useRemoteOrders para PEDIDOS, adaptada a agendas:
 *  - Cada `agenda` local é { protocolo, dateLabel, data, slot, submittedAt, status, ... }.
 *  - Ao registrar (após POST /public/:tenant/eventos bem-sucedido) fica com status='solicitado'.
 *  - Um poll único (não N timers) varre as agendas com status NÃO-terminal e chama
 *    api.statusAgenda para cada uma; transições viram toast.
 *  - Terminais (agendado/confirmado/recusado) param de sofrer poll e ficam como registro.
 *
 * Retorna: { agendas, registrar, seen, markSeen, toasts, dismissToast }.
 */
export function useRemoteAgendas() {
  const [agendas, setAgendas] = useState(() => loadJSON(AGENDAS_KEY, []));
  const [seen, setSeen] = useState(() => loadJSON(AGENDAS_SEEN_KEY, []));
  const [toasts, setToasts] = useState([]);
  const agendasRef = useRef(agendas);
  agendasRef.current = agendas;

  const persist = useCallback((next) => {
    saveJSON(AGENDAS_KEY, next);
    return next;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (t) => {
      setToasts((ts) => (ts.some((x) => x.id === t.id) ? ts : [...ts, t]));
      setTimeout(() => dismissToast(t.id), 10000);
    },
    [dismissToast],
  );

  const markSeen = useCallback((protos) => {
    setSeen((prev) => {
      const next = Array.from(new Set([...prev, ...protos]));
      saveJSON(AGENDAS_SEEN_KEY, next);
      return next;
    });
  }, []);

  /**
   * Registra uma nova solicitação enviada. Deve ser chamado APÓS o POST bem-sucedido
   * em /public/:tenant/eventos (com o protocolo devolvido pelo servidor).
   * @param {{ protocolo, data, slot, dateLabel, tipo? }} nova
   */
  const registrar = useCallback(
    (nova) => {
      if (!nova?.protocolo) return;
      setAgendas((prev) => {
        if (prev.some((a) => a.protocolo === nova.protocolo)) return prev;
        const entry = {
          protocolo: nova.protocolo,
          data: nova.data,
          slot: nova.slot,
          dateLabel: nova.dateLabel,
          tipo: nova.tipo,
          submittedAt: Date.now(),
          status: 'solicitado',
          valor: '0.00',
          motivo_recusa: null,
        };
        return persist([entry, ...prev]);
      });
    },
    [persist],
  );

  // ---------- polling coletivo das agendas não-terminais ----------
  useEffect(() => {
    const tick = async () => {
      const ativas = agendasRef.current.filter((a) => !AGENDA_TERMINAIS.includes(a.status));
      if (!ativas.length) return;
      for (const a of ativas) {
        try {
          const s = await api.statusAgenda(a.protocolo);
          if (s.status !== a.status) {
            setAgendas((prev) => persist(prev.map((x) => (x.protocolo === a.protocolo ? { ...x, ...s } : x))));
            // Toast só em transições relevantes (nada em 'solicitado' → 'solicitado').
            const rotulo =
              s.status === 'agendado' ? 'agendada' :
              s.status === 'confirmado' ? 'confirmada' :
              s.status === 'recusado' ? 'recusada' : null;
            if (rotulo) {
              pushToast({
                id: a.protocolo,
                kind: 'agenda',
                status: s.status,
                titulo: `Sua solicitação foi ${rotulo}`,
                sub: `${a.dateLabel} · ${a.slot}${s.motivo_recusa ? ` — ${s.motivo_recusa}` : ''}`,
              });
            }
          }
        } catch {
          /* rede instável: tenta na próxima rodada */
        }
      }
    };
    const timer = setInterval(tick, POLL_MS);
    tick();
    return () => clearInterval(timer);
  }, [persist, pushToast]);

  return { agendas, registrar, seen, markSeen, toasts, dismissToast };
}
