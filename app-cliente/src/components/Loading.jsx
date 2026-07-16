/** Overlay de carregamento (gerando comanda / enviando solicitação). */
export function Loading({ message, sub }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        animation: 'sdFade .2s ease',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '4px solid rgba(245,166,35,.18)',
          borderTopColor: '#f5a623',
          animation: 'sdSpin .8s linear infinite',
        }}
      />
      <div style={{ textAlign: 'center', padding: '0 30px' }}>
        <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '18px' }}>{message}</div>
        <div style={{ fontSize: '12.5px', color: 'rgba(var(--ink),.5)', marginTop: '6px' }}>{sub}</div>
      </div>
    </div>
  );
}
