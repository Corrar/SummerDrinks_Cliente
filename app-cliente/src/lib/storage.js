/** Lê e faz parse de JSON do localStorage, retornando `fallback` em erro. */
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

/** Serializa e grava um valor no localStorage (silencioso em erro). */
export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* quota / modo privado — ignora */
  }
}
