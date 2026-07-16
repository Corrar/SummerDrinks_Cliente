import { useState, useCallback } from 'react';
import { loadJSON, saveJSON } from '../lib/storage.js';

/**
 * useState com persistência automática em localStorage.
 * Retorna [valor, setValor] — a mesma assinatura de useState.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadJSON(key, initialValue));

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        saveJSON(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set];
}
