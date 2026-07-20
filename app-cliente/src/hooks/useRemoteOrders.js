import { useState, useEffect, useRef, useCallback } from 'react';
import { api, uuid } from '../lib/api.js';
import { enfileirar, autoDrenar } from '../lib/outbox.js';
import { loadJSON, saveJSON } from '../lib/storage.js';
import { assinarPedido } from '../lib/realtime.js';

const ORDERS_KEY = 'sd_orders';
const SEEN_KEY = 'sd_seen';
const POLL_MS = 6000;

/** Pronto para retirada segundo o servidor. */
export function isReady(o) {
  return o.status === 'pronto' || o.status === 'entregue';
}

/**
 * Pedidos com verdade no servidor. Substitui useOrders:
 *  - senha e hora vêm do backend (nada de senha aleatória no cliente);
 *  - offline → outbox reenvia com a mesma idempotência (sem duplicar);
 *  - status é acompanhado por polling com token opaco + push opcional via
 *    Socket.IO (sala pedido:<token>); o polling segue como rede de segurança.
 *  - mantém a mesma superfície de toasts/seen/notificação da UI original.
 *
 * criarPedido() resolve com { ok, order } | { offline:true }.
 */
export function useRemoteOrders() {
  const [orders, setOrders] = useState(() => loadJSON(ORDERS_KEY, []));
  const [seen, setSeen] = useState(() => loadJSON(SEEN_KEY, []));
  const [toasts, setToasts] = useState([]);
  const [notifNewIds, setNotifNewIds] = useState([]);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const persist = useCallback((next) => {
    saveJSON(ORDERS_KEY, next);
    return next;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (o) => {
      setToasts((ts) => (ts.some((t) => t.id === o.id) ? ts : [...ts, { id: o.id, senha: o.senha, name: o.name }]));
      setTimeout(() => dismissToast(o.id), 8000);
    },
    [dismissToast],
  );

  const markSeen = useCallback((ids) => {
    setSeen((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      saveJSON(SEEN_KEY, next);
      return next;
    });
  }, []);

  // ---------- criação ----------
  const criarPedido = useCallback(
    async (cart, checkout) => {
      const idemKey = uuid();
      const payload = {
        cliente: checkout.custName || '',
        pagamento: checkout.method,             // 'pix' | 'cartao' | 'especie'
        pago: !!checkout.payNow,
        itens: cart.items.map((c) => ({ id: c.id, qty: c.qty, p: c.p })),
      };
      const baseOrder = {
        id: Date.now(),
        ts: Date.now(),
        items: cart.items,
        method: checkout.method,
        payNow: !!checkout.payNow,
        name: checkout.custName || '',
      };

      try {
        const resp = await api.criarPedido(payload, idemKey);
        const order = { ...baseOrder, token: resp.token, senha: resp.senha, hora: resp.hora, status: resp.status, total: resp.total };
        setOrders((prev) => persist([order, ...prev]));
        return { ok: true, order };
      } catch (err) {
        if (err && err.rede) {
          // sem conexão → enfileira; o outbox reenvia com a MESMA idempotência.
          enfileirar({ id: idemKey, kind: 'pedido', payload });
          return { offline: true };
        }
        throw err; // 4xx (ex.: item inválido) → App trata
      }
    },
    [persist],
  );

  // ---------- aplicação de um status vindo do servidor (polling OU socket) ----------
  const aplicarStatus = useCallback(
    (token, s) => {
      const alvo = ordersRef.current.find((o) => o.token === token);
      if (!alvo || s.status === alvo.status) return;
      setOrders((prev) => {
        const next = prev.map((x) => (x.token === token ? { ...x, status: s.status, senha: s.senha } : x));
        return persist(next);
      });
      if (s.status === 'pronto') pushToast({ ...alvo, senha: s.senha });
    },
    [persist, pushToast],
  );

  // ---------- push instantâneo (Socket.IO) do pedido em aberto mais recente ----------
  // O handshake fixa UM pedidoToken por conexão; acompanhamos o mais novo em
  // aberto — os demais continuam cobertos pelo polling logo abaixo.
  const tokenAtivo = orders.find((o) => o.token && o.status !== 'entregue')?.token ?? null;
  useEffect(() => {
    if (!tokenAtivo) return undefined;
    return assinarPedido(tokenAtivo, (s) => aplicarStatus(tokenAtivo, s));
  }, [tokenAtivo, aplicarStatus]);

  // ---------- acompanhamento de status (polling com token — rede de segurança) ----------
  useEffect(() => {
    const timer = setInterval(async () => {
      const ativos = ordersRef.current.filter((o) => o.token && o.status !== 'entregue');
      for (const o of ativos) {
        try {
          aplicarStatus(o.token, await api.statusPedido(o.token));
        } catch {
          /* rede instável: tenta na próxima rodada */
        }
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [aplicarStatus]);

  // ---------- avaliação (nota 1-5 + comentário) de pedido entregue ----------
  const avaliar = useCallback(
    async (order, nota, comentario) => {
      const body = { nota, comentario: (comentario || '').trim() };
      const marca = (extra = {}) =>
        setOrders((prev) =>
          persist(prev.map((x) => (x.id === order.id ? { ...x, avaliacao: { ...body, ...extra } } : x))),
        );
      try {
        await api.avaliarPedido(order.token, body);
        marca();
        return { ok: true };
      } catch (err) {
        // Já avaliado (retry/dupla submissão): servidor deduplicou — sucesso.
        if (err && err.codigo === 'AVALIACAO_EXISTENTE') {
          marca();
          return { ok: true };
        }
        if (err && err.rede) {
          // sem conexão → outbox reenvia; marcamos como pendente na UI.
          enfileirar({ id: uuid(), kind: 'avaliacao', payload: { token: order.token, body } });
          marca({ pendente: true });
          return { offline: true };
        }
        throw err; // 4xx real (ex.: pedido não entregue) → tela trata
      }
    },
    [persist],
  );

  // ---------- drenagem do outbox ----------
  useEffect(() => {
    return autoDrenar({
      onEnviado: (entry, resp) => {
        if (entry.kind === 'pedido') {
          // materializa o pedido que estava offline com a senha/token reais
          setOrders((prev) => {
            if (prev.some((o) => o.token === resp.token)) return prev;
            const order = { id: Date.now(), ts: Date.now(), items: [], name: '', method: 'pix', payNow: false, token: resp.token, senha: resp.senha, hora: resp.hora, status: resp.status, total: resp.total };
            return persist([order, ...prev]);
          });
        } else if (entry.kind === 'avaliacao') {
          // avaliação enviada: limpa o "pendente" da UI
          setOrders((prev) =>
            persist(
              prev.map((o) =>
                o.token === entry.payload.token && o.avaliacao
                  ? { ...o, avaliacao: { nota: o.avaliacao.nota, comentario: o.avaliacao.comentario } }
                  : o,
              ),
            ),
          );
        }
        // 'evento' é assunto do useRemoteAgendas — nada a materializar aqui.
      },
      onDescartado: (entry, err) => {
        if (entry.kind !== 'avaliacao') return;
        if (err?.codigo === 'AVALIACAO_EXISTENTE') {
          // Já contou no servidor (ex.: INSERT commitou mas a resposta se perdeu
          // e a drenagem reenviou) — espelha o onEnviado: limpa o "pendente",
          // senão a UI mostraria "enviaremos ao reconectar" para sempre.
          setOrders((prev) =>
            persist(
              prev.map((o) =>
                o.token === entry.payload.token && o.avaliacao
                  ? { ...o, avaliacao: { nota: o.avaliacao.nota, comentario: o.avaliacao.comentario } }
                  : o,
              ),
            ),
          );
        } else {
          // 4xx real (ex.: pedido não entregue): desfaz o otimismo local.
          setOrders((prev) =>
            persist(prev.map((o) => (o.token === entry.payload.token ? { ...o, avaliacao: undefined } : o))),
          );
        }
      },
    });
  }, [persist]);

  return {
    orders,
    criarPedido,
    avaliar,
    seen,
    markSeen,
    toasts,
    dismissToast,
    notifNewIds,
    setNotifNewIds,
  };
}
