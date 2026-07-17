import { BellIcon, SunIcon, MoonIcon } from '../icons.jsx';

/**
 * Cabeçalho fixo: logo, sino de notificações (com contador de não
 * lidos e animação de toque), alternância de tema e status Aberto/Fechado.
 */
export function Header({ open, dark, onToggleTheme, unreadCount, onBell }) {
  const circleBtn = {
    width: '38px',
    height: '38px',
    borderRadius: '999px',
    background: 'var(--surface-2)',
    border: '1px solid rgba(var(--ink),.1)',
    color: 'rgb(var(--ink))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flex: '0 0 auto',
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 20px 14px',
        flex: '0 0 auto',
        zIndex: 4,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 800,
            fontSize: '21px',
            color: 'rgb(var(--ink))',
            letterSpacing: '-.4px',
          }}
        >
          Summer Drinks
        </span>
        <span
          style={{
            fontWeight: 700,
            fontSize: '9px',
            letterSpacing: '3px',
            color: '#f5a623',
            marginTop: '4px',
          }}
        >
          BAR MÓVEL · COQUETELARIA
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onBell} aria-label="Notificações" style={{ ...circleBtn, position: 'relative' }}>
          <span
            style={{
              display: 'flex',
              transformOrigin: '50% 4px',
              animation: unreadCount > 0 ? 'sdBellRing 1.1s ease 1.5' : 'none',
            }}
          >
            <BellIcon size={18} />
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '16px',
                height: '16px',
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
                border: '2px solid var(--bg)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button onClick={onToggleTheme} aria-label="Alternar tema" style={circleBtn}>
          {dark ? <SunIcon size={18} /> : <MoonIcon size={17} />}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '7px 13px',
            borderRadius: '999px',
            background: 'var(--surface-2)',
            border: '1px solid rgba(var(--ink),.08)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: open ? '#b6e84c' : '#e23b3b',
              boxShadow: open ? '0 0 8px #b6e84c' : 'none',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '12px', color: open ? 'rgb(var(--ink))' : 'rgba(var(--ink),.7)' }}>
            {open ? 'Aberto' : 'Fechado'}
          </span>
        </div>
      </div>
    </header>
  );
}
