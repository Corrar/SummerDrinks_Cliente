import { useState, useCallback, useMemo } from 'react';

/**
 * Carrinho de compras em memória.
 * Cada linha: { id, n, p, v, qty }.
 */
export function useCart() {
  const [items, setItems] = useState([]);

  const add = useCallback((it) => {
    setItems((cart) => {
      const existing = cart.find((c) => c.id === it.id);
      if (existing) {
        return cart.map((c) => (c.id === it.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...cart, { id: it.id, n: it.n, p: it.p, v: it.v, qty: 1 }];
    });
  }, []);

  const inc = useCallback((id) => {
    setItems((cart) => cart.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)));
  }, []);

  const dec = useCallback((id) => {
    setItems((cart) =>
      cart.flatMap((c) =>
        c.id === id ? (c.qty > 1 ? [{ ...c, qty: c.qty - 1 }] : []) : [c],
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((a, i) => a + i.p * i.qty, 0), [items]);

  const qtyOf = useCallback(
    (id) => {
      const c = items.find((x) => x.id === id);
      return c ? c.qty : 0;
    },
    [items],
  );

  return { items, add, inc, dec, clear, count, total, qtyOf };
}
