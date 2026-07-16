import { statusOf, STATUS_COLOR, MESES } from '../../data/calendar.js';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons.jsx';

/**
 * Calendário de disponibilidade. Dias livres/parciais são clicáveis;
 * ocupados e passados ficam desabilitados.
 * Props: year, month, selectedDay, onSelectDay, onPrev, onNext.
 */
export function Calendar({ year: y, month: m, selectedDay, onSelectDay, onPrev, onNext }) {
  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const atMinMonth = y === 2026 && m <= 5;

  const cellBase = {
    aspectRatio: '1 / 1',
    borderRadius: '11px',
    border: '1px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    fontFamily: 'Hanken Grotesk',
    fontWeight: 700,
    fontSize: '14px',
  };

  const cells = [];
  for (let i = 0; i < first; i++) {
    cells.push(<span key={'x' + i} style={{ ...cellBase, visibility: 'hidden' }} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const st = statusOf(y, m, d);
    const sel = selectedDay === d;
    const clickable = st === 'livre' || st === 'parcial';
    let style;
    if (st === 'past') style = { ...cellBase, background: 'transparent', color: 'rgba(var(--ink),.18)', cursor: 'default' };
    else if (st === 'ocupado') style = { ...cellBase, background: 'rgba(226,59,59,.08)', color: 'rgba(var(--ink),.3)', cursor: 'not-allowed' };
    else if (sel) style = { ...cellBase, background: '#f5a623', color: '#1a1206', cursor: 'pointer' };
    else style = { ...cellBase, background: 'var(--surface-2)', color: 'rgb(var(--ink))', cursor: 'pointer' };
    const showDot = (st === 'livre' || st === 'parcial' || st === 'ocupado') && !sel;
    cells.push(
      <button key={d} onClick={clickable ? () => onSelectDay(d) : undefined} style={style}>
        <span>{d}</span>
        {showDot && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLOR[st] }} />}
      </button>,
    );
  }

  const navBtn = (disabled) => ({
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: disabled ? 'var(--bg)' : 'var(--surface-2)',
    border: '1px solid rgba(var(--ink),.08)',
    color: disabled ? 'rgba(var(--ink),.2)' : 'rgb(var(--ink))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'default' : 'pointer',
  });

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid rgba(var(--ink),.08)', borderRadius: '18px', padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button onClick={atMinMonth ? undefined : onPrev} style={navBtn(atMinMonth)}>
          <ChevronLeftIcon size={18} />
        </button>
        <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '16px' }}>
          {MESES[m]} {y}
        </span>
        <button onClick={onNext} style={navBtn(false)}>
          <ChevronRightIcon size={18} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '6px' }}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((w, i) => (
          <span key={i} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: 'rgba(var(--ink),.35)' }}>
            {w}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>{cells}</div>

      <div style={{ display: 'flex', gap: '14px', marginTop: '14px', paddingTop: '13px', borderTop: '1px solid rgba(var(--ink),.07)' }}>
        {[
          ['Livre', '#b6e84c'],
          ['Parcial', '#f5a623'],
          ['Ocupado', '#e23b3b'],
        ].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '11px', color: 'rgba(var(--ink),.6)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
