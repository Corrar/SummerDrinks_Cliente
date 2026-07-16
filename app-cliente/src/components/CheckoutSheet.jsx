import { brl } from '../lib/format.js';
import { MapPinIcon } from '../icons.jsx';

/**
 * Sheet de checkout: itens do carrinho, nome da comanda, momento e
 * forma de pagamento. `state` e seus setters são controlados pelo App.
 */
export function CheckoutSheet({ cart, total, checkout, setCheckout, onClose, onConfirm }) {
  const { payNow, method, custName } = checkout;

  const segPay = {
    flex: 1,
    padding: '11px',
    borderRadius: '11px',
    cursor: 'pointer',
    fontFamily: 'Hanken Grotesk',
    fontWeight: 700,
    fontSize: '13px',
    border: '1px solid rgba(var(--ink),.1)',
  };

  const confirmLabel = payNow
    ? method === 'pix'
      ? 'Confirmar e pagar com Pix'
      : 'Confirmar pedido'
    : 'Gerar senha';

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(8,6,4,.6)' }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 21,
          maxHeight: '88%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--sheet)',
          borderRadius: '22px 22px 0 0',
          borderTop: '1px solid rgba(var(--ink),.1)',
          boxShadow: '0 -20px 50px rgba(0,0,0,.5)',
          animation: 'sdSheet .3s cubic-bezier(.2,.9,.3,1)',
        }}
      >
        <div style={{ padding: '16px 20px 6px', flex: '0 0 auto' }}>
          <div style={{ width: '38px', height: '4px', borderRadius: '999px', background: 'rgba(var(--ink),.2)', margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '19px' }}>Seu pedido</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(var(--ink),.5)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              fechar
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(245,166,35,.12)',
              border: '1px solid rgba(245,166,35,.28)',
              borderRadius: '12px',
              padding: '11px 13px',
              marginTop: '12px',
            }}
          >
            <span style={{ display: 'flex', color: '#f5a623', flex: '0 0 auto' }}>
              <MapPinIcon size={20} />
            </span>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#f5a623', lineHeight: 1.35 }}>
              Somente retirada no local — não fazemos entrega.
            </span>
          </div>
        </div>

        <div className="sd-scroll" style={{ flex: '1 1 auto', overflowY: 'auto', padding: '8px 20px 0' }}>
          {cart.items.map((ci) => (
            <div key={ci.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: '1px solid rgba(var(--ink),.07)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{ci.n}</div>
                <div style={{ fontSize: '12px', color: 'rgba(var(--ink),.5)', marginTop: '2px' }}>{brl(ci.p * ci.qty)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--input)', border: '1px solid rgba(var(--ink),.1)', borderRadius: '10px', padding: '3px' }}>
                <button onClick={() => cart.dec(ci.id)} style={qtyBtn('rgb(var(--ink))')}>−</button>
                <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 800, fontSize: '14px' }}>{ci.qty}</span>
                <button onClick={() => cart.inc(ci.id)} style={qtyBtn('#f5a623')}>+</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(var(--ink),.5)', marginBottom: '8px' }}>Nome para a comanda</div>
            <input
              value={custName}
              onChange={(e) => setCheckout((c) => ({ ...c, custName: e.target.value }))}
              placeholder="Opcional"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px 15px',
                borderRadius: '12px',
                background: 'var(--input)',
                border: '1px solid rgba(var(--ink),.1)',
                color: 'rgb(var(--ink))',
                fontFamily: 'Hanken Grotesk',
                fontSize: '14px',
                fontWeight: 500,
              }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(var(--ink),.5)', marginBottom: '8px' }}>Quando pagar?</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                [true, 'Pagar agora'],
                [false, 'Pagar na retirada'],
              ].map(([k, l]) => (
                <button
                  key={String(k)}
                  onClick={() => setCheckout((c) => ({ ...c, payNow: k }))}
                  style={payNow === k ? { ...segPay, background: '#f5a623', color: '#1a1206', borderColor: '#f5a623' } : { ...segPay, background: 'var(--input)', color: 'rgba(var(--ink),.7)' }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {payNow ? (
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(var(--ink),.5)', marginBottom: '8px' }}>Forma de pagamento</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  ['pix', 'Pix'],
                  ['cartao', 'Cartão'],
                  ['especie', 'Espécie'],
                ].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setCheckout((c) => ({ ...c, method: k }))}
                    style={method === k ? { ...segPay, background: 'var(--surface-2)', color: '#f5a623', borderColor: '#f5a623' } : { ...segPay, background: 'var(--input)', color: 'rgba(var(--ink),.7)' }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '14px', fontSize: '12px', lineHeight: 1.5, color: 'rgba(var(--ink),.5)', background: 'var(--surface-2)', borderRadius: '11px', padding: '11px 13px' }}>
              Você paga na retirada — Pix, cartão ou espécie no trailer.
            </div>
          )}
        </div>

        <div style={{ flex: '0 0 auto', padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(var(--ink),.08)', background: 'var(--sheet)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>Total · retirada no local</span>
            <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '24px' }}>{brl(total)}</span>
          </div>
          <button
            onClick={onConfirm}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderRadius: '14px',
              background: '#f5a623',
              color: '#1a1206',
              fontFamily: 'Hanken Grotesk',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

function qtyBtn(color) {
  return {
    width: '28px',
    height: '28px',
    border: 'none',
    background: 'none',
    color,
    cursor: 'pointer',
    fontSize: '18px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
