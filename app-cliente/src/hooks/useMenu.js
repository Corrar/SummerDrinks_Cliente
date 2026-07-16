import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api.js';

const FEATURED_NAMES = [
  'Whisky Energético',
  'Aperol Spritz',
  'Rabo Quente',
  'Fuscão Rosa',
  'Caipirinha',
  'Tetê de ET',
];

/**
 * Cardápio ao vivo do sistema de atendimento. Substitui o import estático de
 * data/menu.js. Mesmo shape de item: { id, n, p, v, d, cat, color, img }.
 *
 * Retorna { items, byCat, featured, loading, erro, reload }.
 */
export function useMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await api.getMenu();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const byCat = useMemo(() => {
    const mapa = new Map();
    for (const it of items) {
      if (!mapa.has(it.cat)) mapa.set(it.cat, { name: it.cat, color: it.color, items: [] });
      mapa.get(it.cat).items.push(it);
    }
    return [...mapa.values()];
  }, [items]);

  const featured = useMemo(
    () => FEATURED_NAMES.map((n) => items.find((i) => i.n === n)).filter(Boolean),
    [items],
  );

  return { items, byCat, featured, loading, erro, reload: carregar };
}
