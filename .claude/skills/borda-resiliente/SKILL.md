# Skill — Borda resiliente (app do cliente)

Use ao mexer no cliente HTTP, no outbox ou nos hooks de rede do app do cliente.

## Onde mora
- `app-cliente-patch/src/lib/api.js` — fetch resiliente + circuit breaker
- `app-cliente-patch/src/lib/outbox.js` — buffer offline de mutações
- `app-cliente-patch/src/hooks/useRemoteOrders.js` — criação + acompanhamento

## Princípios (a rede do trailer vai cair)
1. **Toda mutação é idempotente.** Gere UMA `X-Idempotency-Key` (uuid) por
   intenção do usuário e **reutilize-a** em todo retry e na drenagem do outbox.
   Nunca gere uma nova no retry — isso duplica pedido.
2. **Timeout agressivo.** AbortController em cada requisição (8s). Preso é pior
   que falho: falhe e trate.
3. **Retry só no que é transitório.** Rede/timeout, 5xx, 429. **Nunca** retentar
   4xx (exceto 429) — é erro do payload, retentar só piora.
4. **Backoff + jitter.** Exponencial com ruído aleatório; respeite `Retry-After`.
5. **Circuit breaker.** Após N falhas seguidas, abra e falhe rápido por um cooldown
   — não martele um backend caído.
6. **Offline não perde dado.** Sem rede → outbox (localStorage) com a idem-key.
   Drene no evento `online` e por timer. Reenvio é seguro (servidor deduplica).
7. **Status por polling.** O "pronto" vem de `GET /pedido/:token` com o token
   opaco. Socket é upgrade opcional; polling é a rede de segurança.

## Anti-exemplos
- ❌ `fetch` sem timeout.
- ❌ Retentar um 422/400.
- ❌ Nova idem-key a cada tentativa.
- ❌ Guardar senha/preço localmente como verdade (só o servidor decide).
- ❌ Loop de retry infinito sem circuit breaker.
