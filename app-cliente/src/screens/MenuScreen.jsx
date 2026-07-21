import { useState, useMemo } from 'react';
import { brl } from '../lib/format.js';
import { ImageSlot } from '../components/ImageSlot.jsx';
import { TrendingUpIcon, SearchIcon, PlusIcon, RefreshIcon } from '../icons.jsx';

/**
 * Cardápio: destaques, busca, filtros por categoria e lista agrupada.
 *
 * TODO o conteúdo vem do cardápio VIVO (useMenu → GET /public/:tenant/menu).
 * Nada de lista estática aqui: o `id` de cada item é a referência opaca
 * (`catalogoId__idx`) que o backend re-precifica no checkout — um item de
 * origem local seria recusado com 422 ITEM_INVALIDO.
 */
export function MenuScreen({ menu, onAdd, qtyOf }) {
  const { byCat, featured, loading, erro, reload } = menu;
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todos');
  const q = search.trim().toLowerCase();

  const chips = [{ name: 'Todos', color: '#f5a623', todos: true }, ...byCat.map((c) => ({ name: c.name, color: c.color }))];

  const filteredCats = useMemo(
    () =>
      byCat
        .filter((c) => cat === 'Todos' || cat === c.name)
        .map((c) => {
          const items = c.items.filter(
            (it) => !q || it.n.toLowerCase().includes(q) || it.d.toLowerCase().includes(q),
          );
          return items.length ? { ...c, count: items.length, items } : null;
        })
        .filter(Boolean),
    [byCat, cat, q],
  );

  const chipBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 14px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: 'Hanken Grotesk',
    fontWeight: 700,
    fontSize: '13px',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
    border: '1px solid rgba(var(--ink),.1)',
  };

  // Cardápio ainda não chegou: estado de carga/erro em tela cheia (sem lista
  // fantasma — pedir de um cardápio desatualizado é pior que esperar).
  if (!byCat.length) {
    return (
      <div style={{ textAlign: 'center', padding: '70px 30px', color: 'rgba(var(--ink),.5)' }}>
        {loading ? (
          <>
            <div style={{ margin: '0 auto 14px', width: '26px', height: '26px', border: '3px solid rgba(var(--ink),.12)', borderTopColor: '#f5a623', borderRadius: '50%', animation: 'sdSpin .8s linear infinite' }} />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Carregando o cardápio…</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              {erro ? 'Não conseguimos carregar o cardápio.' : 'Cardápio em preparação.'}
            </div>
            <div style={{ fontSize: '12px', marginBottom: '18px' }}>
              {erro ? 'Verifique sua conexão e tente de novo.' : 'Volte em instantes — estamos organizando as bebidas.'}
            </div>
            <button
              onClick={reload}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 20px', border: 'none', borderRadius: '12px',
                background: '#f5a623', color: '#1a1206',
                fontFamily: 'Hanken Grotesk', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
              }}
            >
              <RefreshIcon size={15} /> Tentar novamente
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '2px 0 0' }}>
      {/* Mais pedidas */}
      {featured.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '6px 20px 14px' }}>
            <span style={{ display: 'flex', color: '#f5a623' }}>
              <TrendingUpIcon size={18} />
            </span>
            <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '18px' }}>Mais pedidas</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(var(--ink),.4)',
                marginLeft: 'auto',
                paddingRight: '20px',
              }}
            >
              os queridinhos
            </span>
          </div>
          <div
            className="sd-scroll"
            style={{
              display: 'flex',
              gap: '13px',
              overflowX: 'auto',
              padding: '0 20px 16px',
              scrollSnapType: 'x mandatory',
            }}
          >
            {featured.map((it, i) => (
              <div
                key={it.id}
                style={{
                  flex: '0 0 196px',
                  width: '196px',
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: 'var(--surface)',
                  border: '1px solid rgba(var(--ink),.08)',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '110px', background: 'var(--input)' }}>
                  <ImageSlot
                    id={'feat-' + it.id}
                    shape="rect"
                    fit="cover"
                    placeholder="Adicionar foto"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 2,
                      pointerEvents: 'none',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#fff',
                      background: 'rgba(0,0,0,.55)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '999px',
                      padding: '3px 9px',
                    }}
                  >
                    {i + 1}º
                  </span>
                </div>
                <div style={{ padding: '12px 13px 13px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.3px', color: 'rgba(var(--ink),.5)' }}>
                    {it.v}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bricolage Grotesque'",
                      fontWeight: 800,
                      fontSize: '17px',
                      lineHeight: 1.1,
                      letterSpacing: '-.3px',
                      flex: 1,
                    }}
                  >
                    {it.n}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '17px', color: it.color }}>
                      {brl(it.p)}
                    </span>
                    <button onClick={() => onAdd(it)} style={addBtn(36, 11)}>
                      <PlusIcon size={19} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Busca + chips */}
      <div style={{ padding: '6px 20px 0' }}>
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: 'rgba(var(--ink),.4)' }}>
            <SearchIcon size={17} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar bebida..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 16px 14px 42px',
              borderRadius: '14px',
              background: 'var(--input)',
              border: 'none',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,.26), inset 0 0 0 1px rgba(var(--ink),.06), 0 1px 0 rgba(var(--ink),.05)',
              color: 'rgb(var(--ink))',
              fontFamily: 'Hanken Grotesk',
              fontSize: '14px',
              fontWeight: 500,
            }}
          />
        </div>

        <div
          className="sd-scroll"
          style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '2px 20px 4px', margin: '0 -20px 18px' }}
        >
          {chips.map((c) => {
            const sel = cat === c.name;
            const selBg = c.color;
            return (
              <button
                key={c.name}
                onClick={() => setCat(c.name)}
                style={
                  sel
                    ? { ...chipBase, background: selBg, color: '#1a1206', borderColor: selBg }
                    : { ...chipBase, background: 'var(--surface)', color: 'rgba(var(--ink),.75)' }
                }
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    background: sel ? 'rgba(26,18,6,.45)' : c.color,
                  }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      {filteredCats.length > 0 ? (
        <div style={{ padding: '0 20px' }}>
          {filteredCats.map((c) => (
            <div key={c.name} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, boxShadow: `0 0 10px ${c.color}` }} />
                <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '18px' }}>{c.name}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(var(--ink),.35)', marginLeft: '2px' }}>{c.count}</span>
              </div>
              {c.items.map((it) => {
                const qty = qtyOf(it.id);
                return (
                  <div
                    key={it.id}
                    style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '13px 0', borderBottom: '1px solid rgba(var(--ink),.07)' }}
                  >
                    <ImageSlot
                      id={'item-' + it.id}
                      shape="rounded"
                      radius={15}
                      fit="cover"
                      placeholder="Foto"
                      style={{ width: '72px', height: '72px', flex: '0 0 auto' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>{it.n}</span>
                        {qty > 0 && (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#1a1206', background: '#b6e84c', borderRadius: '999px', padding: '1px 7px' }}>
                            {qty}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.4px', color: it.color, marginTop: '3px' }}>{it.v}</div>
                      {it.d && (
                        <div style={{ fontSize: '12px', lineHeight: 1.45, color: 'rgba(var(--ink),.5)', marginTop: '5px' }}>{it.d}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: '15px', whiteSpace: 'nowrap' }}>{brl(it.p)}</span>
                      <button onClick={() => onAdd(it)} style={addBtn(34, 10)}>
                        <PlusIcon size={18} />
                      </button>
                      {it.db > 0 && (() => {
                        const dq = qtyOf(it.id + '::d');
                        return (
                          <button
                            onClick={() => onAdd({ ...it, id: it.id + '::d', p: it.p + it.db, v: it.v ? `${it.v} · Dobrada` : 'Dobrada' })}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid ' + (dq > 0 ? '#f5a623' : 'rgba(var(--ink),.2)'), background: dq > 0 ? 'rgba(245,166,35,.16)' : 'transparent', color: dq > 0 ? '#f5a623' : 'rgba(var(--ink),.6)', borderRadius: '999px', padding: '4px 9px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {dq > 0 ? `Dobrada · ${dq}` : `Dobrar +${brl(it.db)}`}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 30px', color: 'rgba(var(--ink),.4)', fontSize: '14px' }}>
          Nenhuma bebida encontrada.
        </div>
      )}
    </div>
  );
}

function addBtn(size, radius) {
  return {
    width: size + 'px',
    height: size + 'px',
    border: 'none',
    borderRadius: radius + 'px',
    background: '#f5a623',
    color: '#1a1206',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flex: '0 0 auto',
  };
}
