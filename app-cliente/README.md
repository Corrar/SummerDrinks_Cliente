# Summer Drinks — Bar Móvel

App mobile de um bar/trailer de coquetelaria: cardápio, carrinho e checkout com senha de retirada, acompanhamento de pedidos, agendamento de eventos e tema claro/escuro. Escrito em **React 18 + Vite**, com hooks e componentes funcionais.

## Rodando

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # build de produção em dist/
npm run preview  # serve o build
```

Sem passo de build, há também `preview.html` na raiz do repositório: um bundle único (React + Babel via CDN) só para visualização rápida — **não** é o artefato de produção.

## Estrutura

```
src/
  main.jsx              # entrypoint (ReactDOM.createRoot)
  App.jsx               # componente raiz: orquestra abas, carrinho, pedidos, overlays
  index.css             # variáveis de tema, keyframes e resets (o resto é estilo inline)
  data/
    menu.js             # cardápio completo (categorias, itens, destaques)
    calendar.js         # disponibilidade da agenda + statusOf()
  lib/
    format.js           # brl(), formatOrderTime()
    storage.js          # helpers de localStorage
    labels.js           # rótulos de pagamento
  hooks/
    useLocalStorage.js  # useState + persistência
    useTheme.js         # tema claro/escuro persistido
    useCart.js          # carrinho (add/inc/dec/total)
    useOrders.js        # pedidos + notificações (timers de "pronto")
  icons.jsx             # ícones SVG (um componente por ícone)
  components/           # Header, BottomNav, ImageSlot, CartBar, Toasts,
                        # NotificationPanel, CheckoutSheet, OrderSuccess,
                        # EventConfirm, Loading
  screens/
    MenuScreen.jsx
    OrdersScreen.jsx
    ContactScreen.jsx
    events/
      EventsScreen.jsx  # calendário + formulário de contratação
      Calendar.jsx
```

## Props do `<App />`

Todas opcionais — úteis para configurar cenários:

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `defaultTab` | `'cardapio' \| 'pedidos' \| 'eventos' \| 'contato'` | `'cardapio'` | Aba inicial |
| `temaInicial` | `'escuro' \| 'claro'` | `'escuro'` | Tema padrão (se não houver preferência salva) |
| `aberta` | `boolean` | `true` | Status Aberto/Fechado no cabeçalho |
| `payNowDefault` | `boolean` | `true` | "Pagar agora" pré-selecionado |
| `prepSegundos` | `number` | `12` | Segundos até um pedido ficar "pronto" (dispara o toast) |

## Persistência

Guardado em `localStorage` (sem back-end):

- `sd_orders` — comandas feitas
- `sd_seen` — ids de notificações já vistas
- `sd_theme` — `dark` / `light`
- `sd_img_<id>` — fotos que o usuário adiciona nos espaços de imagem

## Notas de integração

- **Fotos:** `ImageSlot` é um espaço vazio que o usuário preenche (clique/arraste) e persiste como Data URL. Ao integrar o back-end, troque por `<img src>` vindo da API.
- **Pedidos/eventos:** hoje são simulados com `setTimeout`. Substitua por chamadas reais em `App.confirmOrder` e `App.submitEvent`.
- **Agenda:** as datas ocupadas/parciais em `data/calendar.js` são mockadas — troque por dados da API.
- **Fontes:** Bricolage Grotesque + Hanken Grotesk carregadas do Google Fonts em `index.html`.
