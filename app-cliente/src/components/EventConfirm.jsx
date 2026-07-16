import { SendIcon, CircleCheckBigIcon, CalendarCheckIcon, XIcon } from '../icons.jsx';
import { useAgenda } from '../hooks/useAgenda.js';

/**
 * Modal de confirmação da solicitação de evento.
 * Se recebe um `protocolo` real (formato SD-XXXXXX), acompanha o status ao vivo
 * consultando o backend a cada 15s até virar terminal (agendado/confirmado/recusado).
 * Se o protocolo for texto de fallback (ex.: 'Enviaremos ao reconectar'), o modal
 * não faz polling — apenas informa o envio pendente.
 */
export function EventConfirm({ data, onClose }) {
  const temProtocoloReal = typeof data.protocolo === 'string' && /^SD-[0-9A-Z]{6}$/.test(data.protocolo);
  const { agenda } = useAgenda(temProtocoloReal ? data.protocolo : null);

  const status = agenda?.status ?? 'solicitado';

  // Paleta e mensagem por status.
  let acento = '#f5a623';      // âmbar (solicitado/agendado/confirmado)
  let icone = <SendIcon size={28} />;
  let titulo = 'Solicitação enviada!';
  let subtitulo = (
    <>
      Recebemos seu pedido para <b style={{ color: 'rgb(var(--ink))' }}>{data.dateLabel}</b> · {data.slot}. Em até{' '}
      <b style={{ color: '#f5a623' }}>24 horas</b> sua agenda será processada.
    </>
  );
  if (temProtocoloReal) {
    if (status === 'agendado') {
      icone = <CalendarCheckIcon size={28} />;
      titulo = 'Sua agenda foi confirmada!';
      subtitulo = (
        <>
          <b style={{ color: 'rgb(var(--ink))' }}>{data.dateLabel}</b> · {data.slot} está no calendário do trailer.
          {agenda?.valor && Number(agenda.valor) > 0 && (
            <> Orçamento: <b style={{ color: '#f5a623' }}>R$ {Number(agenda.valor).toFixed(2).replace('.', ',')}</b>.</>
          )}
        </>
      );
    } else if (status === 'confirmado') {
      icone = <CircleCheckBigIcon size={28} />;
      titulo = 'Evento confirmado!';
      subtitulo = (
        <>
          Tudo certo para <b style={{ color: 'rgb(var(--ink))' }}>{data.dateLabel}</b> · {data.slot}. Nos vemos lá!
        </>
      );
    } else if (status === 'recusado') {
      acento = '#e23b3b';
      icone = <XIcon size={28} />;
      titulo = 'Solicitação recusada';
      subtitulo = (
        <>
          Não conseguimos atender {data.dateLabel} · {data.slot}.
          {agenda?.motivo_recusa ? <> Motivo: <b>{agenda.motivo_recusa}</b>.</> : null}
          {' '}Escolha outra data ou fale conosco.
        </>
      );
    }
  }

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
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${acento}29`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: acento }}>
          {icone}
        </div>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '22px', margin: '0 0 8px' }}>{titulo}</h2>
        <p style={{ fontSize: '13px', lineHeight: 1.55, color: 'rgba(var(--ink),.6)', margin: '0 0 18px' }}>
          {subtitulo}
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
          {temProtocoloReal && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '9px', marginTop: '9px', borderTop: '1px solid rgba(var(--ink),.07)' }}>
              <span style={{ fontSize: '11px', color: 'rgba(var(--ink),.45)' }}>Status atual</span>
              <span style={{ fontWeight: 800, fontSize: '13px', color: acento, textTransform: 'capitalize' }}>{status}</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: '13px',
            background: acento,
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
