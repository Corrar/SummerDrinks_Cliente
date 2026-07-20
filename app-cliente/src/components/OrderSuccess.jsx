import { brl } from '../lib/format.js';
import { PAYMENT_LABELS } from '../lib/labels.js';
import { MapPinIcon } from '../icons.jsx';

/**
 * Tela de sucesso do pedido — exibe a senha grande e o resumo.
 * `retirada` (opcional) é o local ativo publicado na config (nome + endereço);
 * sem config carregada, mostra só o texto genérico — nada de endereço fixo.
 */
export function OrderSuccess({ order, retirada, onClose }) {
  const ml = PAYMENT_LABELS[order.method];
  const payStatus = order.payNow ? `Pago via ${ml}` : 'Pagar na retirada';
  const payDot = order.payNow ? '#b6e84c' : '#f5a623';
  const payBg = order.payNow ? 'rgba(182,232,76,.1)' : 'rgba(245,166,35,.1)';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div
        className="sd-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '30px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
      >
        <div style={{ position: 'relative', marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ position: 'absolute', width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #b6e84c', animation: 'sdRingPulse .85s ease-out forwards' }} />
          <span style={{ position: 'absolute', width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #b6e84c', animation: 'sdRingPulse .85s ease-out .18s forwards' }} />
          <div
            style={{
              position: 'relative',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(182,232,76,.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'sdCheckPop .5s cubic-bezier(.18,1.35,.4,1) both',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b6e84c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" style={{ strokeDasharray: 26, strokeDashoffset: 26, animation: 'sdCheckDraw .42s ease .2s forwards' }} />
            </svg>
          </div>
        </div>

        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '24px', margin: '16px 0 4px' }}>Pedido confirmado!</h2>
        <p style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)', margin: '0 0 22px', maxWidth: '280px', lineHeight: 1.5 }}>
          Mostre sua senha no trailer para retirar. Acompanhe a comanda pelo painel do balcão.
        </p>

        <div style={{ width: '100%', background: 'linear-gradient(135deg,#f5a623,#e8890c)', borderRadius: '18px', padding: '22px', color: '#1a1206', boxShadow: '0 14px 36px rgba(245,166,35,.3)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', opacity: 0.7 }}>SUA SENHA</div>
          <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '64px', lineHeight: 1, margin: '6px 0 4px', letterSpacing: '1px' }}>{order.senha}</div>
          {order.name && <div style={{ fontSize: '14px', fontWeight: 700 }}>{order.name}</div>}
        </div>

        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid rgba(var(--ink),.08)', borderRadius: '16px', padding: '16px', marginTop: '16px', textAlign: 'left' }}>
          {order.items.map((oi) => (
            <div key={oi.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '5px 0', fontSize: '13px' }}>
              <span style={{ color: 'rgba(var(--ink),.75)' }}>{oi.qty}× {oi.n}</span>
              <span style={{ fontWeight: 700 }}>{brl(oi.p * oi.qty)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(var(--ink),.08)' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Total</span>
            <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '18px' }}>{brl(order.total)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 12px', background: payBg, borderRadius: '11px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: payDot }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: payDot }}>{payStatus}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: 'rgba(var(--ink),.5)' }}>
          <MapPinIcon size={15} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {retirada ? `Retirada no trailer · ${retirada}` : 'Retirada no trailer'}
          </span>
        </div>
      </div>

      <div style={{ flex: '0 0 auto', padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(var(--ink),.08)' }}>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '15px',
            border: '1px solid rgba(var(--ink),.15)',
            borderRadius: '14px',
            background: 'var(--surface-2)',
            color: 'rgb(var(--ink))',
            fontFamily: 'Hanken Grotesk',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Fazer novo pedido
        </button>
      </div>
    </div>
  );
}
