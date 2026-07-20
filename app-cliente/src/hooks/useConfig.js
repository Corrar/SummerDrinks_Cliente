import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

const CONTATO_VAZIO = { telefone: '', whatsapp: '', email: '', instagram: '' };

/**
 * Configuração pública do tenant: horários, locais e o contato COMERCIAL do bar
 * (telefone/whatsapp/email/instagram — publicados deliberadamente pela gestão
 * para a aba Contato). PII de cliente nunca trafega por aqui.
 *
 * Config muda raramente → sem polling. Um único fetch no mount, cacheado
 * pelo cache-control do backend (public, max-age=60) e por este estado local.
 *
 * Shape: horarios[{ dia, curto, aberto, abre, fecha }],
 *        locais[{ id, nome, endereco, ativo }],
 *        contato{ telefone, whatsapp, email, instagram }.
 */
export function useConfig() {
  const [horarios, setHorarios] = useState([]);
  const [locais, setLocais] = useState([]);
  const [contato, setContato] = useState(CONTATO_VAZIO);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const cfg = await api.getConfig();
      setHorarios(Array.isArray(cfg?.horarios) ? cfg.horarios : []);
      setLocais(Array.isArray(cfg?.locais) ? cfg.locais : []);
      // Backends antigos não mandam `contato` — segue vazio (os cards somem).
      setContato({ ...CONTATO_VAZIO, ...(cfg?.contato ?? {}) });
    } catch (e) {
      setErro(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { horarios, locais, contato, loading, erro, reload: carregar };
}
