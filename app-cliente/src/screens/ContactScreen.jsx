import {
  ClockIcon,
  WhatsappIcon,
  PhoneIcon,
  MailIcon,
  InstagramIcon,
} from '../icons.jsx';

const MAP_SRC =
  'https://www.google.com/maps?q=Av.%20Boa%20Viagem%2C%201500%2C%20Pina%2C%20Recife%20-%20PE&z=15&output=embed';

/** Aba Contato: mapa do trailer, canais de contato e horário. */
export function ContactScreen() {
  const cardLink = {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    textDecoration: 'none',
    color: 'rgb(var(--ink))',
    background: 'var(--surface)',
    border: '1px solid rgba(var(--ink),.08)',
    borderRadius: '14px',
    padding: '14px 15px',
  };
  const iconBox = (bg, color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '11px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    flex: '0 0 auto',
  });

  return (
    <div style={{ padding: '6px 20px 0' }}>
      <span style={{ fontWeight: 700, fontSize: '10px', letterSpacing: '3px', color: '#f5a623' }}>ONDE ESTAMOS</span>
      <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '26px', margin: '8px 0 16px', letterSpacing: '-.5px' }}>
        Fale com a gente
      </h2>

      <div
        style={{
          position: 'relative',
          height: '172px',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1px solid rgba(var(--ink),.08)',
          marginBottom: '6px',
          background: 'var(--input)',
        }}
      >
        <iframe
          title="Localização do trailer Summer Drinks"
          src={MAP_SRC}
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <span
          style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            zIndex: 2,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
            background: 'rgba(0,0,0,.62)',
            backdropFilter: 'blur(4px)',
            padding: '5px 11px',
            borderRadius: '999px',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f5a623' }} />
          Trailer Summer Drinks
        </span>
      </div>

      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid rgba(var(--ink),.08)',
          borderRadius: '0 0 16px 16px',
          borderTop: 'none',
          padding: '14px 16px',
          marginBottom: '14px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '14px' }}>Av. Boa Viagem, 1500 — Pina</div>
        <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)', marginTop: '2px' }}>Recife · PE</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(var(--ink),.07)' }}>
          <span style={{ display: 'flex', color: '#f5a623', marginTop: '1px' }}>
            <ClockIcon size={15} />
          </span>
          <span style={{ fontSize: '12px', lineHeight: 1.45, color: 'rgba(var(--ink),.6)' }}>
            Somos um trailer — a localização pode mudar em eventos. Confirme sempre pelo WhatsApp antes de sair.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a href="https://wa.me/5581999990000" target="_blank" rel="noreferrer" style={cardLink}>
          <span style={iconBox('rgba(182,232,76,.14)', '#b6e84c')}>
            <WhatsappIcon size={20} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>WhatsApp</div>
            <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>(81) 9 9999-0000</div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a1206', background: '#b6e84c', borderRadius: '999px', padding: '7px 14px' }}>
            Chamar
          </span>
        </a>

        <a href="tel:+5581999990000" style={cardLink}>
          <span style={iconBox('rgba(245,166,35,.14)', '#f5a623')}>
            <PhoneIcon size={19} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Telefone</div>
            <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>(81) 3333-0000</div>
          </div>
        </a>

        <a href="mailto:contato@summerdrinks.com.br" style={cardLink}>
          <span style={iconBox('rgba(245,166,35,.14)', '#f5a623')}>
            <MailIcon size={19} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>E-mail</div>
            <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>contato@summerdrinks.com.br</div>
          </div>
        </a>

        <div style={{ ...cardLink, cursor: 'default' }}>
          <span style={iconBox('rgba(245,166,35,.14)', '#f5a623')}>
            <ClockIcon size={19} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Funcionamento</div>
            <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>Sex a Dom · 18h às 02h</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', justifyContent: 'center', margin: '18px 0 4px', color: 'rgba(var(--ink),.5)' }}>
        <InstagramIcon size={16} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>@summerdrinks</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#f5a623', padding: '6px 0 4px' }}>
        SOMENTE RETIRADA NO LOCAL
      </div>
    </div>
  );
}
