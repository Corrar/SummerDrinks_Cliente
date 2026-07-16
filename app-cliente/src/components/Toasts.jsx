import { BellIcon, XIcon } from '../icons.jsx';

/**
 * Pilha de toasts no topo — avisa quando um pedido fica pronto.
 * Clicar leva à aba Pedidos; o "x" dispensa.
 */
export function Toasts({ toasts, onOpen, onDismiss }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '12px 14px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onOpen(t)}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--surface)',
            border: '1px solid rgba(182,232,76,.35)',
            borderLeft: '4px solid #b6e84c',
            borderRadius: '15px',
            padding: '12px 13px',
            boxShadow: '0 16px 40px rgba(0,0,0,.45)',
            cursor: 'pointer',
            animation: 'sdToastIn .45s cubic-bezier(.2,1.1,.3,1)',
          }}
        >
          <span
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(182,232,76,.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#b6e84c',
              flex: '0 0 auto',
              animation: 'sdBellRing 1s ease .2s 2',
            }}
          >
            <BellIcon size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '13.5px', lineHeight: 1.25 }}>
              {t.name ? `${t.name}, seu pedido está pronto!` : 'Seu pedido está pronto!'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(var(--ink),.55)', marginTop: '2px' }}>
              Senha <b style={{ color: '#b6e84c' }}>{t.senha}</b> · retire no trailer
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(t.id);
            }}
            aria-label="Dispensar"
            style={{
              width: '28px',
              height: '28px',
              flex: '0 0 auto',
              border: 'none',
              background: 'var(--surface-2)',
              color: 'rgba(var(--ink),.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
