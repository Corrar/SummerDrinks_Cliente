import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../lib/api.js';

/**
 * Estados terminais do fluxo de agenda — quando o backend chega aqui, não há
 * mais transição possível, então o polling pode parar (economiza rede e bateria).
 */
export const AGENDA_TERMINAIS = ['agendado', 'confirmado', 'recusado'];

/**
 * Polling de status de UMA agenda pelo protocolo público.
 * - Polling default a cada 15s (o backend cacheia? não — no-store; o valor é
 *   um compromisso entre latência percebida pelo cliente e carga na borda).
 * - Auto-stop quando o status vira terminal (nada muda depois).
 * - Retomar? Basta remontar o hook (ou chamar reload()).
 *
 * @param {string|null} protocolo  Se falsy, o hook fica inerte (útil quando o UI
 *                                  ainda não sabe se há protocolo — ex.: offline).
 * @param {object} opts  { intervalMs = 15000, ativo = true }
 * @returns {{ agenda, loading, erro, reload }}
 */
export function useAgenda(protocolo, opts = {}) {
  const { intervalMs = 15000, ativo = true } = opts;
  const [agenda, setAgenda] = useState(null);
  const [loading, setLoading] = useState(!!protocolo);
  const [erro, setErro] = useState(null);
  const timerRef = useRef(null);

  const carregar = useCallback(async () => {
    if (!protocolo) return null;
    try {
      const s = await api.statusAgenda(protocolo);
      setAgenda(s);
      setErro(null);
      return s;
    } catch (e) {
      setErro(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [protocolo]);

  useEffect(() => {
    if (!protocolo || !ativo) return undefined;

    let cancelado = false;

    const agendar = () => {
      if (cancelado) return;
      timerRef.current = setTimeout(async () => {
        const s = await carregar();
        if (cancelado) return;
        // Parar o polling se o backend chegou a um estado terminal.
        if (s && AGENDA_TERMINAIS.includes(s.status)) return;
        agendar();
      }, intervalMs);
    };

    // 1ª leitura imediata; a partir daí, agenda o próximo tick.
    carregar().then((s) => {
      if (cancelado) return;
      if (s && AGENDA_TERMINAIS.includes(s.status)) return;
      agendar();
    });

    return () => {
      cancelado = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [protocolo, ativo, intervalMs, carregar]);

  return { agenda, loading, erro, reload: carregar };
}
