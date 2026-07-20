/* ============================================================
   Cliente HTTP resiliente do app do cliente → sistema de atendimento.

   Rede de trailer falha. Este cliente:
   - timeout agressivo por requisição (AbortController);
   - retry com backoff exponencial + jitter apenas em falha de rede / 5xx / 429;
   - respeita Retry-After;
   - idempotência via X-Idempotency-Key nas mutações (o servidor deduplica);
   - circuit breaker leve: após N falhas seguidas, abre e falha rápido por um
     tempo, evitando martelar um backend caído.

   NUNCA lança preço/senha: o servidor é a fonte da verdade.
   ============================================================ */

import { base } from './config.js';

export class ApiError extends Error {
  constructor(status, codigo, mensagem, corpo) {
    super(mensagem || codigo || 'Erro de API');
    this.name = 'ApiError';
    this.status = status;      // HTTP status (0 = falha de rede/timeout)
    this.codigo = codigo;      // código de domínio do backend, se houver
    this.corpo = corpo;        // corpo bruto
    this.rede = status === 0;  // atalho: falha de conectividade
  }
}

export function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const TIMEOUT_MS = 8000;
const MAX_TENTATIVAS = 3;
const dorme = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- circuit breaker (por processo) ----------
const cb = { falhas: 0, abertoAte: 0 };
const LIMITE_FALHAS = 5;
const COOLDOWN_MS = 15000;

function circuitoAberto() {
  return Date.now() < cb.abertoAte;
}
function registraFalha() {
  cb.falhas += 1;
  if (cb.falhas >= LIMITE_FALHAS) cb.abertoAte = Date.now() + COOLDOWN_MS;
}
function registraSucesso() {
  cb.falhas = 0;
  cb.abertoAte = 0;
}

function backoff(tentativa, retryAfterSeg) {
  if (retryAfterSeg != null) return retryAfterSeg * 1000;
  const b = 300 * 2 ** tentativa;      // 300, 600, 1200...
  const jitter = Math.random() * 250;  // dessincroniza clientes
  return b + jitter;
}

/**
 * Requisição base. Retorna JSON parseado ou lança ApiError.
 * @param {string} path  ex.: '/pedidos'  (relativo ao base público)
 * @param {object} opts  { method, body, idempotencyKey, timeoutMs, tentativas }
 */
async function requisicao(path, opts = {}) {
  const { method = 'GET', body, idempotencyKey, timeoutMs = TIMEOUT_MS, cache } = opts;
  const maxTent = opts.tentativas ?? MAX_TENTATIVAS;

  if (circuitoAberto()) {
    throw new ApiError(0, 'CIRCUITO_ABERTO', 'Serviço temporariamente indisponível.');
  }

  const url = base() + path;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

  let ultimoErro;
  for (let tentativa = 0; tentativa < maxTent; tentativa += 1) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const resp = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: ac.signal,
        ...(cache ? { cache } : {}),
      });
      clearTimeout(timer);

      // 2xx
      if (resp.ok) {
        registraSucesso();
        if (resp.status === 204) return null;
        const txt = await resp.text();
        return txt ? JSON.parse(txt) : null;
      }

      // 429 / 5xx → retentável
      if (resp.status === 429 || resp.status >= 500) {
        const ra = Number(resp.headers.get('retry-after'));
        ultimoErro = new ApiError(resp.status, 'RETENTAVEL', `HTTP ${resp.status}`);
        if (tentativa < maxTent - 1) {
          await dorme(backoff(tentativa, Number.isFinite(ra) ? ra : null));
          continue;
        }
        registraFalha();
        throw ultimoErro;
      }

      // 4xx (exceto 429) → erro permanente, não retentar
      registraSucesso(); // o servidor respondeu; a rede está boa
      let corpo = null;
      try {
        corpo = await resp.json();
      } catch {
        /* corpo não-JSON */
      }
      throw new ApiError(resp.status, corpo?.codigo, corpo?.erro || `HTTP ${resp.status}`, corpo);
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ApiError && err.status !== 0) throw err; // erro HTTP definitivo
      // falha de rede / abort / timeout → retentar
      ultimoErro = new ApiError(0, 'REDE', err?.name === 'AbortError' ? 'Tempo esgotado.' : 'Falha de conexão.');
      if (tentativa < maxTent - 1) {
        await dorme(backoff(tentativa, null));
        continue;
      }
      registraFalha();
      throw ultimoErro;
    }
  }
  throw ultimoErro || new ApiError(0, 'REDE', 'Falha de conexão.');
}

// ---------- API pública ----------
export const api = {
  /** Cardápio ao vivo no shape do app: [{ id, n, p, v, d, cat, color, img }]. */
  getMenu: () => requisicao('/menu'),

  /**
   * Disponibilidade do mês: { mes, dias: { 'YYYY-MM-DD': {tarde,noite,madrugada} } }.
   * `fresco: true` fura o cache HTTP (a rota tem max-age=30) — usado no refetch
   * disparado por `dispo:updated`, que sem isso poderia devolver o snapshot velho.
   */
  getDisponibilidade: (mes, { fresco = false } = {}) =>
    requisicao(`/disponibilidade${mes ? `?mes=${mes}` : ''}`, fresco ? { cache: 'no-store' } : {}),

  /**
   * Cria um pedido. payload: { cliente, pagamento:'pix'|'cartao'|'especie', pago, itens:[{id,qty,p?}] }
   * idemKey OBRIGATÓRIO (reuse no retry evita pedido duplicado).
   * Retorna { token, senha, hora, status, pago, total }.
   */
  criarPedido: (payload, idemKey) =>
    requisicao('/pedidos', { method: 'POST', body: payload, idempotencyKey: idemKey }),

  /** Status de um pedido pelo token: { senha, status, hora, pago }. */
  statusPedido: (token) => requisicao(`/pedido/${token}`, { tentativas: 2 }),

  /**
   * Avalia um pedido ENTREGUE: payload { nota: 1..5, comentario? }. O token
   * opaco é a prova de posse; o servidor deduplica (1 avaliação por pedido —
   * repetição → 409 AVALIACAO_EXISTENTE, que o app trata como sucesso).
   */
  avaliarPedido: (token, payload) =>
    requisicao(`/pedido/${token}/avaliacao`, { method: 'POST', body: payload }),

  /**
   * Cria solicitação de evento (payload COMPLETO).
   * payload: { nome, telefone, email?, tipo, pessoas, local, obs, data:'YYYY-MM-DD', slot:'Tarde'|'Noite'|'Madrugada' }
   * Retorna { protocolo }.
   */
  criarEvento: (payload, idemKey) =>
    requisicao('/eventos', { method: 'POST', body: payload, idempotencyKey: idemKey }),

  /**
   * Status de uma solicitação de evento pelo protocolo público (SD-XXXXXX).
   * Retorna { status, data, hora, valor, motivo_recusa }.
   * `status` ∈ 'solicitado' | 'agendado' | 'confirmado' | 'recusado'.
   * `motivo_recusa` só vem preenchido quando status='recusado'.
   */
  statusAgenda: (protocolo) => requisicao(`/agenda/${protocolo}`, { tentativas: 2 }),

  /**
   * Config pública: { horarios, locais, contato:{ telefone, whatsapp, email, instagram } }.
   * `contato` é o canal COMERCIAL do bar (publicado pela gestão); PII de cliente
   * nunca trafega na borda pública.
   */
  getConfig: () => requisicao('/config'),
};
