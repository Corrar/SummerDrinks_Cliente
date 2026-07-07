# Aplicar a integração no app do cliente (`summer-drinks-react`)

Objetivo: trocar as três fraudes do protótipo — **senha aleatória no browser**,
**pedido que some no refresh** e **solicitação de evento truncada** — por chamadas
reais ao sistema de atendimento, **sem tocar em nenhum componente visual**.

Toda a lógica nova está em arquivos novos; as edições em arquivos existentes são
cirúrgicas (marcadas abaixo). O visual (`components/*`, estilos, temas) não muda.

---

## 1. Copiar os arquivos novos

```
app-cliente-patch/src/lib/config.js          → src/lib/config.js
app-cliente-patch/src/lib/api.js             → src/lib/api.js
app-cliente-patch/src/lib/outbox.js          → src/lib/outbox.js
app-cliente-patch/src/hooks/useMenu.js       → src/hooks/useMenu.js
app-cliente-patch/src/hooks/useRemoteOrders.js → src/hooks/useRemoteOrders.js
```

`useRemoteOrders.js` importa o `src/lib/storage.js` que **já existe** no projeto.

Crie `.env` na raiz do app:

```
VITE_API_URL=https://api.SEU-DOMINIO.com.br
VITE_TENANT=summer
```

Em dev, o default é `http://localhost:3000` / tenant `summer`.

---

## 2. `src/App.jsx` — 4 edições

### 2.1 Imports (topo)

```diff
- import { FEATURED } from './data/menu.js';
  import { useTheme } from './hooks/useTheme.js';
  import { useCart } from './hooks/useCart.js';
- import { useOrders, isReady } from './hooks/useOrders.js';
+ import { useRemoteOrders, isReady } from './hooks/useRemoteOrders.js';
+ import { useMenu } from './hooks/useMenu.js';
+ import { api, uuid } from './lib/api.js';
+ import { enfileirar } from './lib/outbox.js';
```

### 2.2 Hooks (dentro de `App`)

```diff
  const cart = useCart();
- const { orders, addOrder, seen, markSeen, toasts, dismissToast, notifNewIds, setNotifNewIds } = useOrders();
+ const { orders, criarPedido, seen, markSeen, toasts, dismissToast, notifNewIds, setNotifNewIds } = useRemoteOrders();
+ const { featured } = useMenu();
```

E troque o uso de `FEATURED` no JSX:

```diff
- {tab === 'cardapio' && <MenuScreen featured={FEATURED} onAdd={cart.add} qtyOf={cart.qtyOf} />}
+ {tab === 'cardapio' && <MenuScreen featured={featured} onAdd={cart.add} qtyOf={cart.qtyOf} />}
```

### 2.3 `confirmOrder` — senha do servidor, idempotente, offline-safe

```diff
- function confirmOrder() {
-   if (!cart.items.length) return;
-   const senha = 'ABCDEFGH'[Math.floor(Math.random() * 8)] + String(Math.floor(Math.random() * 90) + 10);
-   const prepMs = Math.max(3, prepSegundos) * 1000;
-   const newOrder = { id: Date.now(), ts: Date.now(), prepMs, senha, items: cart.items, total: cart.total, method: checkout.method, payNow: checkout.payNow, name: checkout.custName };
-   setCheckoutOpen(false);
-   setLoading('order');
-   setTimeout(() => {
-     addOrder(newOrder);
-     cart.clear();
-     setOrder(newOrder);
-     setLoading(null);
-   }, 1100);
- }
+ async function confirmOrder() {
+   if (!cart.items.length) return;
+   setCheckoutOpen(false);
+   setLoading('order');
+   try {
+     const r = await criarPedido(cart, checkout);
+     if (r.offline) {
+       // sem conexão: pedido foi enfileirado e será enviado ao reconectar
+       setOrder({ senha: '—', items: cart.items, total: cart.total, method: checkout.method, payNow: checkout.payNow, name: checkout.custName, offline: true });
+     } else {
+       setOrder(r.order); // senha e total REAIS do servidor
+     }
+     cart.clear();
+   } catch (err) {
+     alert(err?.message || 'Não foi possível enviar o pedido. Tente novamente.');
+   } finally {
+     setLoading(null);
+   }
+ }
```

> `prepSegundos` deixa de ser usado (o "pronto" agora vem do servidor). Pode
> manter a prop por compatibilidade — é inofensiva.

### 2.4 `submitEvent` — payload completo + offline-safe

```diff
- function submitEvent(data) {
-   setLoading('event');
-   setTimeout(() => {
-     setEvConfirm(data);
-     setLoading(null);
-   }, 1100);
- }
+ async function submitEvent(data) {
+   setLoading('event');
+   const idemKey = uuid();
+   const payload = {
+     nome: data.nome, telefone: data.telefone, email: data.email,
+     tipo: data.tipo, pessoas: Number(data.pessoas) || 0,
+     local: data.local, obs: data.obs, data: data.data, slot: data.slot,
+   };
+   try {
+     const resp = await api.criarEvento(payload, idemKey);
+     setEvConfirm({ dateLabel: data.dateLabel, slot: data.slot, contact: data.telefone, protocolo: resp.protocolo });
+   } catch (err) {
+     if (err && err.rede) {
+       enfileirar({ id: idemKey, kind: 'evento', payload });
+       setEvConfirm({ dateLabel: data.dateLabel, slot: data.slot, contact: data.telefone, protocolo: 'Enviaremos ao reconectar' });
+     } else {
+       alert(err?.message || 'Não foi possível enviar a solicitação.');
+     }
+   } finally {
+     setLoading(null);
+   }
+ }
```

---

## 3. `src/screens/events/EventsScreen.jsx` — 1 edição em `submit()`

O formulário já coleta tudo; ele só **descartava** os campos. Envie o payload completo:

```diff
  function submit() {
    if (!canSubmit) return;
-   const protocolo = 'SD-' + String(day).padStart(2, '0') + MESES_ABR[month].toUpperCase() + '-' + (Math.floor(Math.random() * 900) + 100);
-   onSubmit({ protocolo, date: `${day} de ${MESES[month]}`, slot, contact: ev.tel });
+   const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
+   onSubmit({
+     nome: ev.nome, telefone: ev.tel, email: ev.email, tipo: ev.tipo,
+     pessoas: ev.pessoas, local: ev.local, obs: ev.obs,
+     data: iso, slot,                          // slot já é 'Tarde'|'Noite'|'Madrugada'
+     dateLabel: `${day} de ${MESES[month]}`,   // rótulo p/ o modal de confirmação
+   });
  }
```

(O `protocolo` real passa a vir do servidor.)

---

## 4. `src/components/EventConfirm.jsx` — trocar 2 campos

O modal lia `data.date` e `data.contact`; agora são `data.dateLabel` e `data.contact`
(este último inalterado). Apenas o rótulo da data muda de chave:

```diff
- Recebemos seu pedido para <b ...>{data.date}</b> · {data.slot}.
+ Recebemos seu pedido para <b ...>{data.dateLabel}</b> · {data.slot}.
```

Nada mais muda: `data.slot`, `data.contact` e `data.protocolo` continuam válidos.

---

## 5. (Opcional) `OrderSuccess` no modo offline

`OrderSuccess` já funciona: exibe `order.senha`. No caminho offline a senha é `'—'`
até o outbox materializar o pedido. Se quiser uma faixa "enviando ao reconectar",
condicione em `order.offline`. Não é obrigatório.

---

## 6. Realtime opcional (upgrade)

O acompanhamento de "pronto" usa **polling** (resiliente, zero dependências).
Para push instantâneo, instale `socket.io-client` e conecte com
`query: { tenantPublico: TENANT, pedidoToken: order.token }`, ouvindo o evento
`pedido:status`. O polling continua como rede de segurança se o socket cair.

---

## Checklist de fumaça (após aplicar)

1. Subir o backend de atendimento (ver `atendimento/`), com um tenant `summer` e catálogo carregado.
2. `npm run dev` no app do cliente.
3. Fazer um pedido → conferir que a **senha é sequencial** (servidor), não aleatória.
4. Recarregar a página → o pedido **persiste** e o status continua atualizando.
5. No PDV/painel, marcar o pedido como `pronto` → o app do cliente **recebe o toast**.
6. Enviar uma solicitação de evento → aparece na **agenda da gestão** como `solicitado`.
7. Desligar a rede, fazer um pedido → ao religar, o outbox **reenvia sem duplicar**.
