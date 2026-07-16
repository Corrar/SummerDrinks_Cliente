import { useState, useEffect, useRef, useCallback } from 'react';
import { loadJSON, saveJSON } from '../lib/storage.js';

const ORDERS_KEY = 'sd_orders';
const SEEN_KEY = 'sd_seen';

/** Um pedido já está pronto para retirada? */
export function isReady(o) {
  return Date.now() >= o.ts + (o.prepMs || 0);
}

/**
 * Pedidos + notificações.
 * - Persiste pedidos e ids "vistos" em localStorage.
 * - Agenda um timer por pedido que dispara um toast quando fica pronto.
 *
 * Retorna: { orders, addOrder, seen, markSeen, toasts, dismissToast,
 *            notifNewIds, setNotifNewIds }.
 */
export function useOrders() {
  const [orders, setOrders] = useState(() => loadJSON(ORDERS_KEY, []));
  const [seen, setSeen] = useState(() => loadJSON(SEEN_KEY, []));
  const [toasts, setToasts] = useState([]);
  const [notifNewIds, setNotifNewIds] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const notifyReady = useCallback(
    (o) => {
      setToasts((ts) => (ts.some((t) => t.id === o.id) ? ts : [...ts, { id: o.id, senha: o.senha, name: o.name }]));
      setTimeout(() => dismissToast(o.id), 8000);
    },
    [dismissToast],
  );

  const scheduleReady = useCallback(
    (o) => {
      if (timers.current[o.id]) return;
      const remaining = o.ts + (o.prepMs || 0) - Date.now();
      if (remaining <= 0) return;
      timers.current[o.id] = setTimeout(() => {
        delete timers.current[o.id];
        notifyReady(o);
      }, remaining);
    },
    [notifyReady],
  );

  // Reagenda avisos de pedidos ainda em preparo ao montar / recarregar.
  useEffect(() => {
    orders.forEach(scheduleReady);
    const snapshot = timers.current;
    return () => Object.values(snapshot).forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addOrder = useCallback(
    (order) => {
      setOrders((prev) => {
        const next = [order, ...prev];
        saveJSON(ORDERS_KEY, next);
        return next;
      });
      scheduleReady(order);
    },
    [scheduleReady],
  );

  const markSeen = useCallback((ids) => {
    setSeen((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      saveJSON(SEEN_KEY, next);
      return next;
    });
  }, []);

  return {
    orders,
    addOrder,
    seen,
    markSeen,
    toasts,
    dismissToast,
    notifNewIds,
    setNotifNewIds,
  };
}
