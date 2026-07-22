import { useState } from 'react';
import { statusOf, slotsOfDay, MESES } from '../../data/calendar.js';
import { Calendar } from './Calendar.jsx';
import { useDispo } from '../../hooks/useDispo.js';
import { PhoneIcon, CalendarCheckIcon } from '../../icons.jsx';

const TIPOS = ['Casamento', 'Aniversário', 'Corporativo', 'Formatura', 'Confraternização', 'Outro'];

/**
 * Aba Eventos: agenda de disponibilidade viva + formulário de contratação.
 * Disponibilidade e ocupação vêm do backend (useDispo → /public/:tenant/disponibilidade).
 * Ao enviar, chama `onSubmit(dados)` — o App faz o POST em /public/:tenant/eventos.
 */
export function EventsScreen({ onSubmit, presets = [], menu = [] }) {
  const hoje = new Date();
  const [year, setYear] = useState(hoje.getFullYear());
  const [month, setMonth] = useState(hoje.getMonth());
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [ev, setEv] = useState({ nome: '', tel: '', email: '', tipo: 'Casamento', pessoas: '', local: '', obs: '' });
  // Cardápio do evento: escolher um preset pronto OU montar o seu (drinks do cardápio).
  const [cardMode, setCardMode] = useState('');      // '' | 'pronto' | 'montar'
  const [presetSel, setPresetSel] = useState('');    // id do preset escolhido
  const [montado, setMontado] = useState([]);        // nomes de drinks escolhidos
  const { dias, loading: dispoLoading } = useDispo(year, month);

  // Nomes únicos de drinks do cardápio vivo (p/ montar o próprio).
  const drinkNames = [...new Set((menu || []).map((m) => m.n).filter(Boolean))];
  const toggleDrink = (nome) =>
    setMontado((prev) => (prev.includes(nome) ? prev.filter((x) => x !== nome) : [...prev, nome]));

  // String final do cardápio que vai na solicitação (aparece no painel).
  function cardapioStr() {
    if (cardMode === 'pronto' && presetSel) {
      const p = presets.find((x) => x.id === presetSel);
      if (p) return p.itens ? `${p.nome}: ${p.itens}` : p.nome;
    }
    if (cardMode === 'montar' && montado.length) return `Personalizado: ${montado.join(', ')}`;
    return '';
  }

  const onEv = (field) => (e) => {
    const v = e.target.value;
    setEv((prev) => ({ ...prev, [field]: v }));
  };

  function selectDay(d) {
    setDay(d);
    setSlot(null);
  }
  function prevMonth() {
    if (year === hoje.getFullYear() && month <= hoje.getMonth()) return;
    setMonth((m) => (m === 0 ? 11 : m - 1));
    if (month === 0) setYear((y) => y - 1);
    setDay(null);
    setSlot(null);
  }
  function nextMonth() {
    setMonth((m) => (m === 11 ? 0 : m + 1));
    if (month === 11) setYear((y) => y + 1);
    setDay(null);
    setSlot(null);
  }

  // Horários do dia derivados da disponibilidade do backend (não mais heurística).
  let slots = [];
  if (day != null) {
    const st = statusOf(dias, year, month, day);
    if (st === 'livre' || st === 'parcial') {
      slots = slotsOfDay(dias, year, month, day);
    }
  }
  const hasDay = day != null && slots.length > 0;

  const canSubmit = !!(ev.nome && ev.tel && day != null && slot);

  function submit() {
    if (!canSubmit) return;
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSubmit({
      nome: ev.nome, telefone: ev.tel, email: ev.email, tipo: ev.tipo,
      pessoas: ev.pessoas, local: ev.local, obs: ev.obs,
      data: iso, slot,
      cardapio: cardapioStr(),
      dateLabel: `${day} de ${MESES[month]}`,
    });
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 15px',
    borderRadius: '12px',
    background: 'var(--input)',
    border: '1px solid rgba(var(--ink),.1)',
    color: 'rgb(var(--ink))',
    fontFamily: 'Hanken Grotesk',
    fontSize: '14px',
    fontWeight: 500,
  };
  const tipoBase = {
    padding: '9px 14px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: 'Hanken Grotesk',
    fontWeight: 700,
    fontSize: '12px',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
    border: '1px solid rgba(var(--ink),.1)',
  };

  return (
    <div style={{ padding: '6px 20px 0' }}>
      <span style={{ fontWeight: 700, fontSize: '10px', letterSpacing: '3px', color: '#f5a623' }}>AGENDAMENTO</span>
      <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '26px', margin: '8px 0 6px', letterSpacing: '-.5px' }}>
        Contrate a equipe
      </h2>
      <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'rgba(var(--ink),.55)', margin: '0 0 18px' }}>
        Barmans e o trailer no seu evento — casamentos, aniversários, festas e corporativos. Escolha uma data livre na agenda.
      </p>

      <Calendar
        year={year}
        month={month}
        dias={dias}
        loading={dispoLoading}
        selectedDay={day}
        onSelectDay={selectDay}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      {hasDay ? (
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Horários para {day} de {MESES[month]}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {slots.map(({ label, time, taken }) => {
              const sel = slot === label;
              const sBase = {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 15px',
                borderRadius: '13px',
                cursor: taken ? 'not-allowed' : 'pointer',
                fontFamily: 'Hanken Grotesk',
                textAlign: 'left',
                border: '1px solid rgba(var(--ink),.1)',
                color: 'rgb(var(--ink))',
              };
              let style;
              if (taken) style = { ...sBase, background: 'rgba(226,59,59,.07)', color: 'rgba(var(--ink),.4)', borderColor: 'transparent' };
              else if (sel) style = { ...sBase, background: 'rgba(245,166,35,.14)', borderColor: '#f5a623' };
              else style = { ...sBase, background: 'var(--surface)' };
              return (
                <button key={label} onClick={taken ? undefined : () => setSlot(label)} style={style}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: '0 0 auto',
                        border: sel ? '2px solid #f5a623' : taken ? '2px solid rgba(var(--ink),.15)' : '2px solid rgba(var(--ink),.28)',
                      }}
                    >
                      {sel && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f5a623' }} />}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{label}</span>
                      <span style={{ fontSize: '11px', opacity: 0.7 }}>{time}</span>
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: taken ? 'rgba(226,59,59,.16)' : 'rgba(182,232,76,.16)',
                      color: taken ? '#e23b3b' : '#b6e84c',
                    }}
                  >
                    {taken ? 'Ocupado' : 'Livre'}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Dados do evento</div>
            <input value={ev.nome} onChange={onEv('nome')} placeholder="Seu nome *" style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={ev.tel} onChange={onEv('tel')} placeholder="WhatsApp *" style={inputStyle} />
              <input value={ev.pessoas} onChange={onEv('pessoas')} placeholder="Nº pessoas" style={inputStyle} />
            </div>
            <input value={ev.email} onChange={onEv('email')} placeholder="E-mail" style={inputStyle} />
            <input value={ev.local} onChange={onEv('local')} placeholder="Local / endereço do evento" style={inputStyle} />

            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(var(--ink),.5)', marginBottom: '8px' }}>Tipo de evento</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setEv((prev) => ({ ...prev, tipo: t }))}
                    style={
                      ev.tipo === t
                        ? { ...tipoBase, background: '#f5a623', color: '#1a1206', borderColor: '#f5a623' }
                        : { ...tipoBase, background: 'var(--surface)', color: 'rgba(var(--ink),.7)' }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* ---- Cardápio do evento: pronto (preset) ou montar o seu ---- */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(var(--ink),.5)', marginBottom: '8px' }}>
                Cardápio do evento <span style={{ fontWeight: 500, opacity: 0.7 }}>(opcional)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: cardMode ? '11px' : 0 }}>
                {[['pronto', 'Escolher um pronto'], ['montar', 'Montar o meu']].map(([k, label]) => {
                  const on = cardMode === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setCardMode((m) => (m === k ? '' : k))}
                      style={{ ...tipoBase, flex: 1, textAlign: 'center', ...(on ? { background: '#f5a623', color: '#1a1206', borderColor: '#f5a623' } : { background: 'var(--surface)', color: 'rgba(var(--ink),.7)' }) }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {cardMode === 'pronto' && (
                presets.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {presets.map((p) => {
                      const on = presetSel === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPresetSel(on ? '' : p.id)}
                          style={{ textAlign: 'left', padding: '12px 13px', borderRadius: '12px', cursor: 'pointer', border: '1.5px solid ' + (on ? '#f5a623' : 'rgba(var(--ink),.1)'), background: on ? 'rgba(245,166,35,.12)' : 'var(--surface)', color: 'rgb(var(--ink))' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '13.5px' }}>
                            <span style={{ color: '#f5a623' }}>★</span>{p.nome}{on && <span style={{ marginLeft: 'auto', color: '#f5a623', fontSize: '12px' }}>✓ escolhido</span>}
                          </div>
                          {p.itens && <div style={{ fontSize: '12px', color: 'rgba(var(--ink),.55)', marginTop: '4px', lineHeight: 1.4 }}>{p.itens}</div>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: 'rgba(var(--ink),.55)', padding: '4px 2px' }}>
                    Nenhum cardápio pronto disponível — toque em “Montar o meu”.
                  </div>
                )
              )}

              {cardMode === 'montar' && (
                drinkNames.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {drinkNames.map((n) => {
                      const on = montado.includes(n);
                      return (
                        <button
                          key={n}
                          onClick={() => toggleDrink(n)}
                          style={{ ...tipoBase, whiteSpace: 'normal', textAlign: 'left', ...(on ? { background: '#f5a623', color: '#1a1206', borderColor: '#f5a623' } : { background: 'var(--surface)', color: 'rgba(var(--ink),.7)' }) }}
                        >
                          {on ? '✓ ' : '+ '}{n}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: 'rgba(var(--ink),.55)', padding: '4px 2px' }}>
                    Cardápio indisponível no momento.
                  </div>
                )
              )}
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(var(--ink),.5)', marginBottom: '8px' }}>Conte sobre o evento</div>
              <textarea
                value={ev.obs}
                onChange={onEv('obs')}
                placeholder="Tipo de pacote, bebidas desejadas, duração, estrutura do local, nº de bartenders..."
                rows={4}
                style={{ ...inputStyle, minHeight: '94px', lineHeight: 1.5, resize: 'none', boxShadow: 'inset 0 2px 5px rgba(0,0,0,.18)' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(245,166,35,.1)',
                border: '1px solid rgba(245,166,35,.24)',
                borderRadius: '12px',
                padding: '12px 13px',
              }}
            >
              <span style={{ display: 'flex', color: '#f5a623', flex: '0 0 auto' }}>
                <PhoneIcon size={19} />
              </span>
              <span style={{ fontSize: '12.5px', fontWeight: 600, lineHeight: 1.4, color: 'rgba(var(--ink),.75)' }}>
                Nossa equipe entrará em contato para confirmação.
              </span>
            </div>

            <button
              onClick={submit}
              disabled={!canSubmit}
              style={{
                width: '100%',
                padding: '15px',
                border: 'none',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px',
                background: canSubmit ? '#f5a623' : 'var(--surface-2)',
                color: canSubmit ? '#1a1206' : 'rgba(var(--ink),.4)',
                fontFamily: 'Hanken Grotesk',
                fontWeight: 800,
                fontSize: '15px',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 8px 22px rgba(245,166,35,.28)' : 'none',
                transition: 'background-color .2s ease, box-shadow .2s ease',
              }}
            >
              <CalendarCheckIcon size={18} />
              Solicitar agendamento
            </button>
            <p style={{ fontSize: '11px', lineHeight: 1.5, color: 'rgba(var(--ink),.4)', textAlign: 'center', margin: 0 }}>
              Sua solicitação é analisada em até 24h. Nossa equipe entrará em contato para confirmar.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '14px 20px 30px', color: 'rgba(var(--ink),.4)', fontSize: '13px' }}>
          Selecione um dia livre ou parcial para ver os horários.
        </div>
      )}
    </div>
  );
}
