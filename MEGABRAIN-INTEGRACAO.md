# MEGABRAIN — Integração App do Cliente ↔ Sistema de Atendimento

Fonte única de verdade da ponte entre os **dois** sistemas Summer Drinks.
Leia antes de tocar em qualquer arquivo. Se algo aqui conflitar com o código, o
código está errado — conserte o código, não este documento.

> **Onde o código vive** — o backend saiu deste repo e agora mora em
> [`Corrar/SummerDrinks_Atendimento`](https://github.com/Corrar/SummerDrinks_Atendimento).
> Este repo (`SummerDrinks_Cliente`) fica com o PWA (`app-cliente/`) e o patch
> histórico (`app-cliente-patch/`). Caminhos citados aqui como `atendimento/src/...`
> referem-se ao **repo de atendimento**, não a uma pasta deste repo.

---

## 0. Os dois sistemas

| | **App do Cliente** (`Sistema_para_React.zip`) | **Sistema de Atendimento** (`atendimento/`) |
|---|---|---|
| Papel | PWA que o **cliente final** usa | Backend + PDV/Painel/Agenda da **operação** |
| Emite | pedidos e solicitações de evento | — |
| Consome | menu, disponibilidade, status do pedido | pedidos e eventos vindos do app |
| Verdade sobre | **nada de dinheiro** | preço, senha, status, valor, disponibilidade |

O app do cliente é **mundo hostil**. A fronteira entre eles é a **borda pública**
(`/public/:tenant/*`) — o único ponto onde os dois se tocam, e onde mora todo o
hardening. Ver `SECURITY-BORDA.md`.

---

## 1. As três fraudes do protótipo (que a integração conserta)

1. **Senha aleatória no browser** — `confirmOrder()` fazia
   `'ABCDEFGH'[rand]+2díg`. Duas pessoas podiam receber a mesma senha; o PDV
   nunca via o pedido. → Agora a senha é **alocada atomicamente pelo servidor**
   por `(tenant, dia)` e devolvida ao app.
2. **Pedido volátil** — `useOrders` guardava só em `localStorage`; o balcão não
   tinha o pedido. → Agora o pedido nasce no **ledger do atendimento**; o app só
   acompanha por um **token opaco**.
3. **Evento truncado** — `submitEvent` mandava só `{protocolo,date,slot,contact}`
   e jogava fora `nome,email,tipo,pessoas,local,obs` + data ISO. → Agora o
   **payload completo** vira uma `agenda { status:'solicitado', origem:'app_cliente' }`.

---

## 2. ACL — tabelas de mapeamento (app → domínio)

Toda tradução vive em `atendimento/src/types/acl.ts` (funções puras).

### 2.1 Pagamento
| App (`method`) | Domínio (`pagamento`) |
|---|---|
| `pix` | `Pix` |
| `cartao` | `Cartão` |
| `especie` | `Dinheiro` |

`payNow` (bool) → `pago` (bool).

### 2.2 Item de pedido (re-precificação)
O app manda **referência**, não preço. O `id` do menu público é
`"{catalogoId}__{tamanhoIdx}"`.

| App (`item`) | Domínio (`ItemPedido`) |
|---|---|
| `id` = `"whe__0"` | decodifica → `catalogoId='whe'`, `idx=0` |
| `qty` | `qty` |
| `p` (opcional) | **ignorado** (só loga divergência) |
| — | `preco` = `catalogo.tamanhos[idx].preco` (**servidor**) |
| — | `nome` = `"{nome} · {rotulo}"` |

Item sem correspondência no catálogo → **HTTP 422 `ITEM_INVALIDO`**. Nunca adivinhar preço.

### 2.3 Evento (formulário → agenda)
| App | Domínio (`agenda`) |
|---|---|
| `nome` | `cliente` |
| `tel` | `telefone` (PII — nunca sai em GET público) |
| `email` | `email` (PII) |
| `tipo` | `tipo` |
| `data` (ISO) | `data` |
| `slot` `Tarde/Noite/Madrugada` | `hora` `14:00/19:00/23:00` |
| `local` | `local` |
| `pessoas` | `pessoas` (coerção int) |
| `obs` | `obs` (sanitizado) |
| — | `valor` = `0` (**servidor** — orçado depois) |
| — | `status` = `solicitado`, `origem` = `app_cliente` |
| — | `protocolo` = `SD-XXXXXX` (**servidor**) |

---

## 3. Fluxos

### 3.1 Pedido (app → atendimento)
```
App: POST /public/:tenant/pedidos
     body { cliente, pagamento, pago, itens:[{id,qty,p?}] }
     header X-Idempotency-Key: <uuid>
  → EdgeIngestService.ingestPedido
      1. _reprecificar (1 query, id=ANY) — servidor define preço
      2. OrderService.criar (idempotente + senha atômica)   ← ESCRITOR ÚNICO
      3. vincula token público opaco (UPDATE ... COALESCE)
  → emitir(tenantId, 'order:created')  → PDV/Painel em tempo real
  ← 201 { token, senha, hora, status, pago, total }   (200 em replay)
```

### 3.2 Status (atendimento → app) — back-channel
```
PDV: PATCH /orders/:senha/status { status:'pronto' }
  → OrderService.marcarStatus
  → emitir(tenantId,'order:updated')                    (gestão)
  → notificarCliente → emitirStatusPedido(token, ...)   (sala pública 'pedido:{token}')
App: recebe 'pedido:status' (socket)  E/OU  GET /public/:tenant/pedido/:token (polling)
     → toast "senha X pronta"
```
Polling é o mecanismo **padrão** (resiliente, zero dep). Socket é upgrade.

### 3.3 Evento (app → atendimento)
```
App: POST /public/:tenant/eventos  body { nome,telefone,email,tipo,pessoas,local,obs,data,slot }
  → EdgeIngestService.ingestEvento (agenda + outbox 'evento:recebido', transacional)
  → emitir(tenantId,'agenda:updated')   → tela de Agenda da gestão
  ← 202 { protocolo }
```

---

## 4. Trust model (resumo — detalhe em SECURITY-BORDA.md)

- **Preço**: sempre do catálogo no servidor. `p` do cliente nunca vira dinheiro.
- **Senha**: nunca do cliente. Alocação atômica `INSERT ... ON CONFLICT DO UPDATE`.
- **Status/valor/origem/tenant**: fixados server-side.
- **PII de CLIENTE** (agenda.telefone/email): entra, é gravada, **nunca sai** em rota
  pública nem log. Distinto do **contato COMERCIAL do bar** (config.telefone/whatsapp/
  email/instagram), publicado deliberadamente em `GET /public/:tenant/config` →
  `{ horarios, locais, contato }` para a aba Contato do app.
- **Idempotência**: `X-Idempotency-Key` → `op_key` UNIQUE no banco. Retry/replay não duplica.
- **Rate limit**: por `IP+tenant`, separado para pedido (20/min) e evento (5/min).
- **Token**: uuid opaco; a sala realtime é chaveada só pelo token (o cliente não conhece o tenant_id).

---

## 5. Resiliência do app (rede de trailer)

- Timeout 8s por requisição (AbortController).
- Retry backoff exponencial + jitter só em rede/5xx/429; respeita Retry-After.
- Circuit breaker: 5 falhas seguidas → abre 15s (falha rápido).
- **Outbox offline**: mutação sem rede vai para `localStorage` com sua idem-key;
  drena no `online` e a cada 20s. Reenvio é seguro (servidor deduplica).

---

## 6. Plano faseado (gate-controlled)

- **Fase 0 — Contrato** ✅ mapeado (este doc). Shapes app e domínio confirmados no código-fonte.
- **Fase 1 — Borda de pedido**: `migration 002`, ACL, `pedidoPublicoSchema`,
  `EdgeIngestService.ingestPedido`, rota `/pedidos`, `/pedido/:token`. Gate:
  smoke de senha concorrente (0 colisão, replays idempotentes).
- **Fase 2 — App conectado**: aplicar `app-cliente-patch` (APLICAR.md). Gate:
  checklist de fumaça (senha sequencial, persiste no refresh, toast de pronto).
- **Fase 3 — Evento**: rota `/eventos` + patch do formulário. Gate: solicitação
  cai na Agenda como `solicitado`; PII não vaza.
- **Fase 4 — Disponibilidade viva**: mesclar slots ocupados por agenda aceita em
  `/disponibilidade`; emitir `dispo:updated` à sala pública. ✅ (o app assina a
  sala via `lib/realtime.js` e refaz o fetch do mês; polling continua de rede de segurança)
- **Fase 5 — Notificação ao cliente**: worker de outbox → WhatsApp quando o evento
  muda de estado. ✅ `GreenApiTransport` real em `notif/transport.ts`; ligar com
  `NOTIF_DRIVER=green` + `GREEN_API_ID_INSTANCE`/`GREEN_API_TOKEN` no deploy.
- **Fase 6 — Cardápio único**: `data/menu.js` REMOVIDO do app; todo o cardápio
  (destaques, busca, categorias) vem de `GET /menu`. O cardápio real é semeado no
  catálogo do atendimento por `npm run seed:menu` e gerido pelo painel (Cardápio).

---

## 7. O que NUNCA fazer

- ❌ Confiar em preço, senha, total ou status vindos do app.
- ❌ Escrever pedido fora do `OrderService` (escritor único).
- ❌ Expor telefone/email em qualquer rota `/public/*` ou em log.
- ❌ Gerar senha no cliente (voltar à fraude do protótipo).
- ❌ Regenerar `X-Idempotency-Key` no retry (quebra a deduplicação).
- ❌ Renomear campos do domínio (`domain.ts`) — o PDV/Painel dependem deles.
- ❌ Chavear a sala realtime pública por `tenant_id` (o cliente não o conhece; use o token).
