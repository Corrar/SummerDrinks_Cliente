import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import { assinarDispo } from '../lib/realtime.js';

/**
 * Disponibilidade viva do mês (fonte: /public/:tenant/disponibilidade).
 * Refetch automático quando (year, month) muda e quando o servidor emite
 * `dispo:updated` na sala pública (Socket.IO). Shape de `dias`:
 *   { 'YYYY-MM-DD': { tarde: bool, noite: bool, madrugada: bool } }
 * Um dia ausente em `dias` significa "não declarado na base" (indisponível).
 */
export function useDispo(year, month) {
  const [dias, setDias] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    const mes = `${year}-${String(month + 1).padStart(2, '0')}`;
    setLoading(true);
    setErro(null);
    try {
      const resp = await api.getDisponibilidade(mes);
      setDias(resp?.dias || {});
    } catch (e) {
      setErro(e);
      setDias({});
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Push do servidor → refetch do mês corrente (o payload do evento é só um
  // aviso; a verdade continua sendo o GET, que já desconta a ocupação).
  useEffect(() => assinarDispo(() => carregar()), [carregar]);

  return { dias, loading, erro, reload: carregar };
}
