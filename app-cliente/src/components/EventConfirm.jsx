import { SendIcon, CircleCheckBigIcon } from '../icons.jsx';

/** Modal de confirmação da solicitação de evento. */
export function EventConfirm({ data, onClose }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: 'rgba(8,6,4,.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid rgba(var(--ink),.1)',
          borderRadius: '22px',
          padding: '28px 22px',
          textAlign: 'center',
          animation: 'sdModalIn .3s cubic-bezier(.2,1,.3,1)',
        }}
      >
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,166,35,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#f5a623' }}>
          <SendIcon size={28} />
        </div>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '22px', margin: '0 0 8px' }}>Solicitação enviada!</h2>
        <p style={{ fontSize: '13px', lineHeight: 1.55, color: 'rgba(var(--ink),.6)', margin: '0 0 18px' }}>
          Recebemos seu pedido para <b style={{ color: 'rgb(var(--ink))' }}>{data.dateLabel}</b> · {data.slot}. Em até{' '}
          <b style={{ color: '#f5a623' }}>24 horas</b> sua agenda será processada.
        </p>
        <div style={{ background: 'var(--surface-2)', borderRadius: '13px', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '9px' }}>
            <span style={{ display: 'flex', color: '#b6e84c' }}>
              <CircleCheckBigIcon size={17} />
            </span>
            <span style={{ fontSize: '12px', lineHeight: 1.4, color: 'rgba(var(--ink),.7)' }}>
              Nossa equipe entrará em contato pelo <b style={{ color: 'rgb(var(--ink))' }}>WhatsApp {data.contact}</b> para confirmar.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '9px', borderTop: '1px solid rgba(var(--ink),.07)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(var(--ink),.45)' }}>Protocolo</span>
            <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '13px', letterSpacing: '.5px' }}>{data.protocolo}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
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
          Entendi
        </button>
      </div>
    </div>
  );
}
