import { useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

/**
 * Espaço de foto que o usuário preenche (clique ou arraste uma imagem).
 * A imagem é guardada como Data URL em localStorage, sob a chave `id`,
 * então persiste entre sessões. Substitua por <img src> vindo da API
 * quando integrar o back-end.
 *
 * Props:
 *  - id          chave única (persistência)
 *  - shape       'rect' | 'rounded' | 'circle'
 *  - radius      raio em px quando shape='rounded'
 *  - fit         'cover' | 'contain'
 *  - placeholder texto do estado vazio
 *  - style       estilos extra do contêiner
 */
export function ImageSlot({
  id,
  shape = 'rect',
  radius = 0,
  fit = 'cover',
  placeholder = 'Adicionar foto',
  style = {},
}) {
  const [src, setSrc] = useLocalStorage('sd_img_' + id, '');
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  const borderRadius =
    shape === 'circle' ? '50%' : shape === 'rounded' ? radius + 'px' : 0;

  function readFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setOver(false);
    readFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  }

  return (
    <div
      onClick={() => inputRef.current && inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius,
        background: 'var(--input)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: over ? 'inset 0 0 0 2px #f5a623' : 'none',
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
        />
      ) : (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'rgba(var(--ink),.35)',
            textAlign: 'center',
            padding: '4px 8px',
            lineHeight: 1.3,
            pointerEvents: 'none',
          }}
        >
          {placeholder}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => readFile(e.target.files && e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  );
}
