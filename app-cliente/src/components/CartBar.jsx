import { brl } from '../lib/format.js';

/** Barra flutuante do carrinho — abre o checkout. */
export function CartBar({ count, total, onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={{
        position: 'absolute',
        left: '14px',
        right: '14px',
        bottom: '80px',
        zIndex: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        background: '#f5a623',
        border: 'none',
        borderRadius: '15px',
        padding: '13px 16px',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(245,166,35,.3)',
        animation: 'sdRise .25s ease',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            minWidth: '26px',
            height: '26px',
            padding: '0 7px',
            boxSizing: 'border-box',
            background: '#1a1206',
            color: '#f5a623',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {count}
        </span>
        <span style={{ fontWeight: 800, fontSize: '14px', color: '#1a1206' }}>Ver pedido</span>
      </span>
      <span
        style={{
          fontFamily: "'Bricolage Grotesque'",
          fontWeight: 800,
          fontSize: '16px',
          color: '#1a1206',
        }}
      >
        {brl(total)}
      </span>
    </button>
  );
}
