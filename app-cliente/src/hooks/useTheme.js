import { useState, useCallback } from 'react';
import { loadJSON, saveJSON } from '../lib/storage.js';

const KEY = 'sd_theme';

/**
 * Tema claro/escuro persistido. `temaInicial` ('escuro' | 'claro')
 * define o padrão apenas quando não há preferência salva.
 * Retorna { dark, toggle }.
 */
export function useTheme(temaInicial = 'escuro') {
  const [dark, setDark] = useState(() => {
    const saved = loadJSON(KEY, null);
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return temaInicial !== 'claro';
  });

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      saveJSON(KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return { dark, toggle };
}
