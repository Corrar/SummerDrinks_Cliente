import { brl, formatOrderTime } from '../lib/format.js';
import { PAYMENT_LABELS } from '../lib/labels.js';
import { isReady } from '../hooks/useOrders.js';
import { CupIcon } from '../icons.jsx';

/** Aba "Meus pedidos": lista de comandas com senha e status. */
export function OrdersScreen({ orders, onGoCardapio }) {
  return (
    <div style={{ padding: '6px 20px 0' }}>
      <span style={{ fontWeight: 700, fontSize: '10px', letterSpacing: '3px', color: '#f5a623' }}>SUAS COMANDAS</span>
      <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '26px', margin: '8px 0 16px', letterSpacing: '-.5px' }}>
        Meus pedidos
      </h2>

      {orders.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {orders.map((o) => {
              const preparing = !isReady(o);
              const ml = PAYMENT_LABELS[o.method] || '';
              return (
                <div
                  key={o.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(var(--ink),.08)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'stretch',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(160deg,#f5a623,#e8890c)',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minWidth: '92px',
                    }}
                  >
                    <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: 'rgba(26,18,6,.6)' }}>SENHA</span>
                    <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '34px', lineHeight: 1, color: '#1a1206' }}>
                      {o.senha}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: preparing ? 'rgba(245,166,35,.16)' : 'rgba(182,232,76,.16)',
                          color: preparing ? '#f5a623' : '#b6e84c',
                        }}
                      >
                        {preparing ? 'Em preparo' : 'Pronto p/ retirada'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(var(--ink),.4)', whiteSpace: 'nowrap' }}>{formatOrderTime(o.ts)}</span>
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: 1.4, color: 'rgba(var(--ink),.6)' }}>
                      {o.items.map((it) => `${it.qty}× ${it.n}`).join(', ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: o.payNow ? '#b6e84c' : '#f5a623' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: o.payNow ? '#b6e84c' : '#f5a623' }}>
                          {o.payNow ? `Pago · ${ml}` : 'Pagar na retirada'}
                        </span>
                      </span>
                      <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '16px' }}>{brl(o.total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '11px', lineHeight: 1.5, color: 'rgba(var(--ink),.4)', textAlign: 'center', margin: '18px 0 4px' }}>
            Mostre a senha no trailer para retirar. Suas comandas ficam salvas neste aparelho.
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'rgba(var(--ink),.3)',
            }}
          >
            <CupIcon size={30} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>Nenhum pedido ainda</div>
          <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'rgba(var(--ink),.45)', margin: '0 0 18px' }}>
            Faça seu primeiro pedido no cardápio e acompanhe a senha por aqui.
          </p>
          <button
            onClick={onGoCardapio}
            style={{
              padding: '13px 22px',
              border: 'none',
              borderRadius: '13px',
              background: '#f5a623',
              color: '#1a1206',
              fontFamily: 'Hanken Grotesk',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Ver cardápio
          </button>
        </div>
      )}
    </div>
  );
}
