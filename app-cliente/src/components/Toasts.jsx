import { BellIcon, XIcon, CalendarCheckIcon } from '../icons.jsx';

/**
 * Pilha de toasts no topo. Aceita 2 formatos:
 *  - PEDIDO (legado, sem `kind`): { id, senha, name } — visual verde, texto "pedido pronto".
 *  - AGENDA (novo, kind:'agenda'): { id, kind:'agenda', status, titulo, sub } — visual muda com o status.
 * Clicar chama onOpen(t); "x" chama onDismiss(t.id).
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
      {toasts.map((t) => {
        const isAgenda = t.kind === 'agenda';
        // Paleta por origem/estado.
        //  - pedido pronto → verde.
        //  - agenda agendada/confirmada → âmbar (positivo, mas ainda "para o futuro").
        //  - agenda recusada → vermelho.
        let cor;
        if (!isAgenda) cor = { fg: '#b6e84c', bg: 'rgba(182,232,76,.16)', border: 'rgba(182,232,76,.35)' };
        else if (t.status === 'recusado') cor = { fg: '#e23b3b', bg: 'rgba(226,59,59,.16)', border: 'rgba(226,59,59,.35)' };
        else cor = { fg: '#f5a623', bg: 'rgba(245,166,35,.16)', border: 'rgba(245,166,35,.35)' };

        return (
          <div
            key={t.id}
            onClick={() => onOpen(t)}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--surface)',
              border: `1px solid ${cor.border}`,
              borderLeft: `4px solid ${cor.fg}`,
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
                background: cor.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cor.fg,
                flex: '0 0 auto',
                animation: isAgenda ? undefined : 'sdBellRing 1s ease .2s 2',
              }}
            >
              {isAgenda ? <CalendarCheckIcon size={22} /> : <BellIcon size={22} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '13.5px', lineHeight: 1.25 }}>
                {isAgenda ? t.titulo : (t.name ? `${t.name}, seu pedido está pronto!` : 'Seu pedido está pronto!')}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(var(--ink),.55)', marginTop: '2px' }}>
                {isAgenda ? t.sub : (<>Senha <b style={{ color: cor.fg }}>{t.senha}</b> · retire no trailer</>)}
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
        );
      })}
    </div>
  );
}
