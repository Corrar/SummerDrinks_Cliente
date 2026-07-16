import { useState } from 'react';
import { useTheme } from './hooks/useTheme.js';
import { useCart } from './hooks/useCart.js';
import { useRemoteOrders, isReady } from './hooks/useRemoteOrders.js';
import { useRemoteAgendas } from './hooks/useRemoteAgendas.js';
import { useMenu } from './hooks/useMenu.js';
import { api, uuid } from './lib/api.js';
import { enfileirar } from './lib/outbox.js';

import { Header } from './components/Header.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { CartBar } from './components/CartBar.jsx';
import { Toasts } from './components/Toasts.jsx';
import { NotificationPanel } from './components/NotificationPanel.jsx';
import { CheckoutSheet } from './components/CheckoutSheet.jsx';
import { OrderSuccess } from './components/OrderSuccess.jsx';
import { EventConfirm } from './components/EventConfirm.jsx';
import { Loading } from './components/Loading.jsx';

import { MenuScreen } from './screens/MenuScreen.jsx';
import { OrdersScreen } from './screens/OrdersScreen.jsx';
import { ContactScreen } from './screens/ContactScreen.jsx';
import { EventsScreen } from './screens/events/EventsScreen.jsx';

/**
 * App raiz do Summer Drinks.
 *
 * Props (todas opcionais):
 *  - defaultTab      'cardapio' | 'pedidos' | 'eventos' | 'contato'
 *  - temaInicial     'escuro' | 'claro'  (usado se não houver preferência salva)
 *  - aberta          boolean — status Aberto/Fechado no cabeçalho
 *  - payNowDefault   boolean — "Pagar agora" pré-selecionado no checkout
 *  - prepSegundos    number  — tempo de preparo até o pedido ficar pronto
 */
export function App({
  defaultTab = 'cardapio',
  temaInicial = 'escuro',
  aberta = true,
  payNowDefault = true,
  prepSegundos = 12,
}) {
  const [tab, setTab] = useState(defaultTab);
  const { dark, toggle } = useTheme(temaInicial);
  const cart = useCart();
  const { orders, criarPedido, seen, markSeen, toasts: toastsPedido, dismissToast: dismissToastPedido, notifNewIds, setNotifNewIds } = useRemoteOrders();
  const { registrar: registrarAgenda, toasts: toastsAgenda, dismissToast: dismissToastAgenda } = useRemoteAgendas();
  const { featured } = useMenu();

  // Toasts unificados: pedidos (verde, "pronto") + agendas (âmbar/vermelho, status mudou).
  const toasts = [...toastsPedido, ...toastsAgenda];
  const dismissToast = (id) => {
    dismissToastPedido(id);
    dismissToastAgenda(id);
  };

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkout, setCheckout] = useState({ payNow: payNowDefault, method: 'pix', custName: '' });
  const [order, setOrder] = useState(null); // pedido confirmado (tela de sucesso)
  const [evConfirm, setEvConfirm] = useState(null);
  const [loading, setLoading] = useState(null); // 'order' | 'event' | null
  const [notifOpen, setNotifOpen] = useState(false);

  const readyOrders = orders.filter(isReady);
  const unreadCount = readyOrders.filter((o) => !seen.includes(o.id)).length;

  async function confirmOrder() {
    if (!cart.items.length) return;
    setCheckoutOpen(false);
    setLoading('order');
    try {
      const r = await criarPedido(cart, checkout);
      if (r.offline) {
        setOrder({ senha: '—', items: cart.items, total: cart.total, method: checkout.method, payNow: checkout.payNow, name: checkout.custName, offline: true });
      } else {
        setOrder(r.order);
      }
      cart.clear();
    } catch (err) {
      alert(err?.message || 'Não foi possível enviar o pedido. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }

  async function submitEvent(data) {
    setLoading('event');
    const idemKey = uuid();
    const payload = {
      nome: data.nome, telefone: data.telefone, email: data.email,
      tipo: data.tipo, pessoas: Number(data.pessoas) || 0,
      local: data.local, obs: data.obs, data: data.data, slot: data.slot,
    };
    try {
      const resp = await api.criarEvento(payload, idemKey);
      registrarAgenda({
        protocolo: resp.protocolo,
        data: data.data,
        slot: data.slot,
        dateLabel: data.dateLabel,
        tipo: data.tipo,
      });
      setEvConfirm({ dateLabel: data.dateLabel, slot: data.slot, contact: data.telefone, protocolo: resp.protocolo });
    } catch (err) {
      if (err && err.rede) {
        enfileirar({ id: idemKey, kind: 'evento', payload });
        setEvConfirm({ dateLabel: data.dateLabel, slot: data.slot, contact: data.telefone, protocolo: 'Enviaremos ao reconectar' });
      } else {
        alert(err?.message || 'Não foi possível enviar a solicitação.');
      }
    } finally {
      setLoading(null);
    }
  }

  function openBell() {
    const newIds = readyOrders.filter((o) => !seen.includes(o.id)).map((o) => o.id);
    markSeen(readyOrders.map((o) => o.id));
    setNotifNewIds(newIds);
    setNotifOpen(true);
  }

  const showCartBar = cart.items.length > 0 && !checkoutOpen && !order;

  return (
    <div
      className="sd-app"
      data-theme={dark ? 'dark' : 'light'}
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(120% 80% at 50% 0%, var(--backdrop-2) 0%, var(--backdrop) 60%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        fontFamily: "'Hanken Grotesk',sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          minHeight: '640px',
          height: '100dvh',
          background: 'var(--bg)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 90px rgba(0,0,0,.7)',
          color: 'rgb(var(--ink))',
        }}
      >
        <Header
          open={aberta}
          dark={dark}
          onToggleTheme={toggle}
          unreadCount={unreadCount}
          onBell={openBell}
        />

        <main className="sd-scroll" style={{ flex: '1 1 auto', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 150px' }}>
          {tab === 'cardapio' && <MenuScreen featured={featured} onAdd={cart.add} qtyOf={cart.qtyOf} />}
          {tab === 'pedidos' && <OrdersScreen orders={orders} onGoCardapio={() => setTab('cardapio')} />}
          {tab === 'eventos' && <EventsScreen onSubmit={submitEvent} />}
          {tab === 'contato' && <ContactScreen />}
        </main>

        <Toasts
          toasts={toasts}
          onOpen={(t) => {
            // Agenda → aba Eventos; pedido → aba Pedidos.
            setTab(t.kind === 'agenda' ? 'eventos' : 'pedidos');
            dismissToast(t.id);
          }}
          onDismiss={dismissToast}
        />

        {notifOpen && (
          <NotificationPanel
            orders={orders}
            notifNewIds={notifNewIds}
            onClose={() => setNotifOpen(false)}
            onGoPedidos={() => {
              setTab('pedidos');
              setNotifOpen(false);
            }}
          />
        )}

        {showCartBar && <CartBar count={cart.count} total={cart.total} onOpen={() => setCheckoutOpen(true)} />}

        <BottomNav tab={tab} onTab={setTab} orderCount={orders.length} />

        {loading && (
          <Loading
            message={loading === 'order' ? 'Gerando sua comanda' : 'Enviando solicitação'}
            sub={loading === 'order' ? 'Confirmando seu pedido para retirada...' : 'Processaremos sua agenda em até 24h...'}
          />
        )}

        {checkoutOpen && (
          <CheckoutSheet
            cart={cart}
            total={cart.total}
            checkout={checkout}
            setCheckout={setCheckout}
            onClose={() => setCheckoutOpen(false)}
            onConfirm={confirmOrder}
          />
        )}

        {order && (
          <OrderSuccess
            order={order}
            onClose={() => {
              setOrder(null);
              setCheckout((c) => ({ ...c, custName: '' }));
            }}
          />
        )}

        {evConfirm && <EventConfirm data={evConfirm} onClose={() => setEvConfirm(null)} />}
      </div>
    </div>
  );
}
