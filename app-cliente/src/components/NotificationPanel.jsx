import { formatOrderTime } from '../lib/format.js';
import { isReady } from '../hooks/useOrders.js';
import { BellIcon, XIcon, ChevronRightIcon, CheckCircleIcon } from '../icons.jsx';

/**
 * Painel de notificações (dropdown ancorado no sino).
 * Lista pedidos prontos para retirada; marca como "NOVO" os
 * ainda não vistos.
 */
export function NotificationPanel({ orders, notifNewIds, onClose, onGoPedidos }) {
  const ready = orders
    .filter(isReady)
    .slice()
    .sort((a, b) => b.ts + (b.prepMs || 0) - (a.ts + (a.prepMs || 0)));

  const countLabel =
    ready.length === 0
      ? 'Sem avisos'
      : ready.length === 1
        ? '1 pedido pronto para retirar'
        : `${ready.length} pedidos prontos para retirar`;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 51,
          background: 'rgba(8,6,4,.45)',
          animation: 'sdFade .18s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '58px',
          right: '12px',
          zIndex: 52,
          width: '320px',
          maxWidth: 'calc(100% - 24px)',
          maxHeight: '74%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--sheet)',
          border: '1px solid rgba(var(--ink),.12)',
          borderRadius: '18px',
          boxShadow: '0 24px 58px rgba(0,0,0,.6)',
          overflow: 'hidden',
          transformOrigin: '88% 0',
          animation: 'sdMenuIn .22s cubic-bezier(.2,1,.3,1)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '-6px',
            right: '44px',
            width: '12px',
            height: '12px',
            background: 'var(--sheet)',
            borderLeft: '1px solid rgba(var(--ink),.12)',
            borderTop: '1px solid rgba(var(--ink),.12)',
            transform: 'rotate(45deg)',
            borderRadius: '2px 0 0 0',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '15px 16px 13px',
            borderBottom: '1px solid rgba(var(--ink),.08)',
            flex: '0 0 auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'Bricolage Grotesque'",
                fontWeight: 800,
                fontSize: '17px',
                letterSpacing: '-.3px',
              }}
            >
              Notificações
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'rgba(var(--ink),.45)' }}>
              {countLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: '30px',
              height: '30px',
              flex: '0 0 auto',
              border: 'none',
              background: 'var(--surface-2)',
              color: 'rgba(var(--ink),.55)',
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon size={15} />
          </button>
        </div>

        <div className="sd-scroll" style={{ overflowY: 'auto', flex: '1 1 auto', padding: '6px 0' }}>
          {ready.length > 0 ? (
            ready.map((o) => {
              const isNew = notifNewIds.includes(o.id);
              return (
                <button
                  key={o.id}
                  onClick={onGoPedidos}
                  style={{
                    width: 'calc(100% - 16px)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: '13px',
                    margin: '2px 8px',
                    padding: '11px 12px',
                    cursor: 'pointer',
                    color: 'rgb(var(--ink))',
                    background: isNew ? 'rgba(182,232,76,.09)' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(182,232,76,.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#b6e84c',
                      flex: '0 0 auto',
                    }}
                  >
                    <CheckCircleIcon size={19} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '13.5px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {o.name ? `Olá ${o.name}, pedido pronto!` : 'Pedido pronto p/ retirada'}
                      </span>
                      {isNew && (
                        <span
                          style={{
                            flex: '0 0 auto',
                            fontSize: '9px',
                            fontWeight: 800,
                            letterSpacing: '.6px',
                            color: '#1a1206',
                            background: '#b6e84c',
                            borderRadius: '999px',
                            padding: '2px 6px',
                          }}
                        >
                          NOVO
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'rgba(var(--ink),.5)',
                        marginTop: '4px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 800,
                          color: '#1a1206',
                          background: '#f5a623',
                          borderRadius: '6px',
                          padding: '1px 7px',
                          fontFamily: "'Bricolage Grotesque'",
                        }}
                      >
                        {o.senha}
                      </span>
                      <span>· {formatOrderTime(o.ts + (o.prepMs || 0))}</span>
                    </span>
                  </span>
                  <ChevronRightIcon size={16} style={{ flex: '0 0 auto', stroke: 'rgba(var(--ink),.28)' }} />
                </button>
              );
            })
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '34px 30px 38px',
                color: 'rgba(var(--ink),.45)',
                fontSize: '13px',
                lineHeight: 1.55,
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'var(--surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  color: 'rgba(var(--ink),.32)',
                }}
              >
                <BellIcon size={25} stroke={1.8} />
              </div>
              <div style={{ fontWeight: 700, color: 'rgba(var(--ink),.6)', fontSize: '13.5px', marginBottom: '4px' }}>
                Tudo em dia
              </div>
              Avisaremos aqui quando seu pedido ficar pronto.
            </div>
          )}
        </div>

        {ready.length > 0 && (
          <div
            style={{
              flex: '0 0 auto',
              padding: '11px 14px calc(12px + env(safe-area-inset-bottom))',
              borderTop: '1px solid rgba(var(--ink),.08)',
              background: 'var(--sheet)',
            }}
          >
            <button
              onClick={onGoPedidos}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                border: '1px solid rgba(var(--ink),.12)',
                borderRadius: '11px',
                background: 'var(--surface-2)',
                color: 'rgb(var(--ink))',
                fontFamily: 'Hanken Grotesk',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Ver meus pedidos
              <ChevronRightIcon size={15} stroke={2.4} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
