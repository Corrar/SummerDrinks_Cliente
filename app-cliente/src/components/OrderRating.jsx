import { useState } from 'react';
import { StarIcon } from '../icons.jsx';

/**
 * Avaliação de um pedido ENTREGUE: 5 estrelas + comentário opcional.
 * `onSubmit(nota, comentario)` → Promise ({ ok } | { offline }); erros são
 * tratados pelo App (alert). Depois de avaliado, o pai renderiza o resumo
 * (RatingDone) no lugar deste formulário.
 */
export function OrderRating({ onSubmit }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!nota || enviando) return;
    setEnviando(true);
    try {
      await onSubmit(nota, comentario);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ borderTop: '1px solid rgba(var(--ink),.07)', paddingTop: '10px', marginTop: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(var(--ink),.5)' }}>Avalie:</span>
        <div style={{ display: 'flex', gap: '3px' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setNota(n)}
              aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '2px',
                cursor: 'pointer',
                display: 'flex',
                color: n <= nota ? '#f5a623' : 'rgba(var(--ink),.25)',
              }}
            >
              <StarIcon size={20} filled={n <= nota} />
            </button>
          ))}
        </div>
      </div>

      {nota > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '9px' }}>
          <input
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={600}
            placeholder="Deixe um comentário (opcional)"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 12px',
              borderRadius: '11px',
              border: 'none',
              background: 'var(--input)',
              boxShadow: 'inset 0 0 0 1px rgba(var(--ink),.08)',
              color: 'rgb(var(--ink))',
              fontFamily: 'Hanken Grotesk',
              fontSize: '13px',
            }}
          />
          <button
            onClick={enviar}
            disabled={enviando}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '11px',
              background: '#f5a623',
              color: '#1a1206',
              fontFamily: 'Hanken Grotesk',
              fontWeight: 800,
              fontSize: '12.5px',
              cursor: 'pointer',
              flex: '0 0 auto',
              opacity: enviando ? 0.6 : 1,
            }}
          >
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      )}
    </div>
  );
}

/** Resumo pós-avaliação: estrelas dadas + agradecimento (ou aviso de pendência offline). */
export function RatingDone({ avaliacao }) {
  return (
    <div style={{ borderTop: '1px solid rgba(var(--ink),.07)', paddingTop: '10px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '2px', color: '#f5a623' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ display: 'flex', color: n <= avaliacao.nota ? '#f5a623' : 'rgba(var(--ink),.2)' }}>
            <StarIcon size={16} filled={n <= avaliacao.nota} />
          </span>
        ))}
      </div>
      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(var(--ink),.5)' }}>
        {avaliacao.pendente ? 'Enviaremos sua avaliação ao reconectar.' : 'Obrigado pelo feedback!'}
      </span>
    </div>
  );
}
