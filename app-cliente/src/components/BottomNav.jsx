import { NavMenuIcon, NavOrdersIcon, NavEventsIcon, NavContactIcon } from '../icons.jsx';

const TABS = [
  { key: 'cardapio', text: 'Cardápio', Icon: NavMenuIcon },
  { key: 'pedidos', text: 'Pedidos', Icon: NavOrdersIcon },
  { key: 'eventos', text: 'Eventos', Icon: NavEventsIcon },
  { key: 'contato', text: 'Contato', Icon: NavContactIcon },
];

/**
 * Navegação inferior em "pílula". A aba ativa expande e revela o rótulo.
 * O badge de "Pedidos" mostra a quantidade de comandas.
 */
export function BottomNav({ tab, onTab, orderCount }) {
  return (
    <nav
      style={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: '4px',
        margin: '0 12px calc(12px + env(safe-area-inset-bottom))',
        padding: '7px',
        background: 'var(--bg-2)',
        border: '1px solid rgba(var(--ink),.09)',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,.28)',
        zIndex: 6,
      }}
    >
      {TABS.map(({ key, text, Icon }) => {
        const on = tab === key;
        const showBadge = key === 'pedidos' && orderCount > 0;
        return (
          <button
            key={key}
            onClick={() => onTab(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Hanken Grotesk',
              borderRadius: '999px',
              overflow: 'hidden',
              padding: on ? '11px 16px' : '11px 13px',
              background: on ? 'rgba(245,166,35,.16)' : 'transparent',
              color: on ? '#f5a623' : 'rgba(var(--ink),.45)',
              transition:
                'background-color .28s ease, color .28s ease, padding .28s cubic-bezier(.3,.8,.3,1)',
            }}
          >
            <span style={{ position: 'relative', display: 'flex', flex: '0 0 auto' }}>
              <Icon size={21} />
              {showBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-7px',
                    minWidth: '15px',
                    height: '15px',
                    padding: '0 4px',
                    boxSizing: 'border-box',
                    background: '#b6e84c',
                    color: '#1a1206',
                    borderRadius: '999px',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-2)',
                  }}
                >
                  {orderCount}
                </span>
              )}
            </span>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                transition:
                  'max-width .3s cubic-bezier(.3,.8,.3,1), opacity .22s ease, margin .3s ease',
                maxWidth: on ? '96px' : '0px',
                opacity: on ? 1 : 0,
                marginLeft: on ? '8px' : '0px',
              }}
            >
              {text}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
