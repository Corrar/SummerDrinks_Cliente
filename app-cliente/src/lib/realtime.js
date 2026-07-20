/* ============================================================
   Realtime OPCIONAL (Socket.IO) — upgrade sobre o polling.

   O backend aceita, no handshake público, `query.tenantPublico` (sala de
   disponibilidade) e opcionalmente `query.pedidoToken` (sala de UM pedido).
   Como o token do pedido é fixado no handshake, este módulo mantém UM socket
   singleton e reconecta quando o pedido acompanhado muda.

   Regras (skill borda-resiliente):
   - Polling continua como rede de segurança — nada aqui substitui o timer.
   - Read-only: só recebemos eventos; nunca enviamos mutação por socket.
   - Falha de socket é silenciosa (reconexão automática do socket.io);
     o app segue 100% funcional sem ele.
   ============================================================ */

import { io } from 'socket.io-client';
import { API_URL, TENANT } from './config.js';

const st = {
  socket: null,
  pedidoToken: null,
  cbsPedido: new Set(),
  cbsDispo: new Set(),
};

function desconectar() {
  if (st.socket) {
    st.socket.disconnect();
    st.socket = null;
  }
}

function garantirSocket(pedidoToken) {
  const alvo = pedidoToken ?? st.pedidoToken;
  if (st.socket && st.pedidoToken === alvo) return;
  desconectar();
  st.pedidoToken = alvo;
  const query = { tenantPublico: TENANT };
  if (alvo) query.pedidoToken = alvo;
  st.socket = io(API_URL, {
    query,
    transports: ['websocket', 'polling'],
    reconnectionDelayMax: 30000,
  });
  st.socket.on('pedido:status', (p) => st.cbsPedido.forEach((cb) => cb(p)));
  st.socket.on('dispo:updated', (p) => st.cbsDispo.forEach((cb) => cb(p)));
}

function talvezDesligar() {
  if (!st.cbsPedido.size && !st.cbsDispo.size) {
    desconectar();
    st.pedidoToken = null;
  }
}

/**
 * Acompanha o status de UM pedido (o mais recente em aberto). `cb` recebe
 * { senha, status, hora, pago }. Retorna o unsubscribe.
 */
export function assinarPedido(token, cb) {
  st.cbsPedido.add(cb);
  garantirSocket(token);
  return () => {
    st.cbsPedido.delete(cb);
    talvezDesligar();
  };
}

/** Recebe `dispo:updated` da sala pública do tenant. Retorna o unsubscribe. */
export function assinarDispo(cb) {
  st.cbsDispo.add(cb);
  garantirSocket(null);
  return () => {
    st.cbsDispo.delete(cb);
    talvezDesligar();
  };
}
