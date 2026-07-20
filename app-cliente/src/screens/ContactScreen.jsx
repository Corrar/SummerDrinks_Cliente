import { Fragment } from 'react';
import {
  ClockIcon,
  WhatsappIcon,
  PhoneIcon,
  MailIcon,
  InstagramIcon,
  RefreshIcon,
} from '../icons.jsx';
import { useConfig } from '../hooks/useConfig.js';
import { rotuloHorario } from '../lib/schedule.js';

const ENDERECO_FALLBACK = { nome: 'Av. Boa Viagem, 1500 — Pina', endereco: 'Recife · PE' };

function mapaSrc(consulta) {
  return `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&z=15&output=embed`;
}

/** Só dígitos, com DDI 55 na frente quando o número vier sem código do país. */
function digitosBr(numero) {
  const d = String(numero || '').replace(/\D/g, '');
  if (!d) return '';
  return d.length <= 11 ? `55${d}` : d;
}

/**
 * Aba Contato — TUDO vivo via /public/config: mapa/endereço (locais), canais
 * (contato comercial publicado pela gestão) e horários. Canal sem valor
 * configurado simplesmente não aparece — nada de número fake hardcoded.
 */
export function ContactScreen() {
  const { horarios, locais, contato, loading, erro, reload } = useConfig();
  const temCanal = !!(contato.whatsapp || contato.telefone || contato.email);

  // Local ativo prioritário; se o backend não devolveu nada, cai no fallback visível.
  const localAtivo = locais.find((l) => l.ativo) ?? locais[0] ?? ENDERECO_FALLBACK;
  const enderecoBusca = `${localAtivo.nome} ${localAtivo.endereco}`.trim();

  // Horários por dia da semana, ordem canônica Dom→Sáb; só mostra os que a gestão declarou.
  const horariosOrdenados = horarios.slice().sort((a, b) => {
    const ORDEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const idx = (h) => ORDEM.indexOf(String(h?.curto ?? '').toLowerCase().slice(0, 3));
    return idx(a) - idx(b);
  });
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
          src={mapaSrc(enderecoBusca)}
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
        <div style={{ fontWeight: 700, fontSize: '14px' }}>{localAtivo.nome}</div>
        <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)', marginTop: '2px' }}>{localAtivo.endereco}</div>
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
        {/* Regressão evitada: sem rede, os canais NÃO podem sumir em silêncio —
            é exatamente quando o cliente mais precisa ligar/chamar no WhatsApp. */}
        {!temCanal && (erro || loading) && (
          <div style={{ ...cardLink, cursor: 'default', display: 'block', textAlign: 'center', padding: '18px 15px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(var(--ink),.6)', marginBottom: erro ? '12px' : 0 }}>
              {erro ? 'Não foi possível carregar os contatos.' : 'Carregando contatos…'}
            </div>
            {erro && (
              <button
                onClick={reload}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '10px 18px', border: 'none', borderRadius: '11px',
                  background: '#f5a623', color: '#1a1206',
                  fontFamily: 'Hanken Grotesk', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                }}
              >
                <RefreshIcon size={14} /> Tentar novamente
              </button>
            )}
          </div>
        )}

        {contato.whatsapp && (
          <a href={`https://wa.me/${digitosBr(contato.whatsapp)}`} target="_blank" rel="noreferrer" style={cardLink}>
            <span style={iconBox('rgba(182,232,76,.14)', '#b6e84c')}>
              <WhatsappIcon size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>WhatsApp</div>
              <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>{contato.whatsapp}</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a1206', background: '#b6e84c', borderRadius: '999px', padding: '7px 14px' }}>
              Chamar
            </span>
          </a>
        )}

        {contato.telefone && (
          <a href={`tel:+${digitosBr(contato.telefone)}`} style={cardLink}>
            <span style={iconBox('rgba(245,166,35,.14)', '#f5a623')}>
              <PhoneIcon size={19} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Telefone</div>
              <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>{contato.telefone}</div>
            </div>
          </a>
        )}

        {contato.email && (
          <a href={`mailto:${contato.email}`} style={cardLink}>
            <span style={iconBox('rgba(245,166,35,.14)', '#f5a623')}>
              <MailIcon size={19} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>E-mail</div>
              <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)' }}>{contato.email}</div>
            </div>
          </a>
        )}

        <div style={{ ...cardLink, cursor: 'default', display: 'block', padding: '14px 15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: horariosOrdenados.length ? '10px' : 0 }}>
            <span style={iconBox('rgba(245,166,35,.14)', '#f5a623')}>
              <ClockIcon size={19} />
            </span>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Funcionamento</div>
          </div>
          {horariosOrdenados.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: '6px', columnGap: '12px', fontSize: '13px', color: 'rgba(var(--ink),.65)', paddingLeft: '53px' }}>
              {horariosOrdenados.map((h) => (
                <Fragment key={h.curto || h.dia}>
                  <span style={{ fontWeight: 600 }}>{h.dia}</span>
                  <span style={{ color: h.aberto ? 'rgb(var(--ink))' : 'rgba(var(--ink),.4)' }}>{rotuloHorario(h)}</span>
                </Fragment>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'rgba(var(--ink),.55)', paddingLeft: '53px' }}>Horário será divulgado em breve.</div>
          )}
        </div>
      </div>

      {contato.instagram && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', justifyContent: 'center', margin: '18px 0 4px', color: 'rgba(var(--ink),.5)' }}>
          <InstagramIcon size={16} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{contato.instagram}</span>
        </div>
      )}
      <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#f5a623', padding: '6px 0 4px' }}>
        SOMENTE RETIRADA NO LOCAL
      </div>
    </div>
  );
}
