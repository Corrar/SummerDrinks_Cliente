import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

/**
 * Configuração pública do tenant (horarios + locais). PII (telefone/whatsapp)
 * NÃO vem por aqui — a rota `/public/:tenant/config` foi desenhada para
 * expor só o que é seguro. Contatos ficam hardcoded/env no PWA.
 *
 * Config muda raramente → sem polling. Um único fetch no mount, cacheado
 * pelo cache-control do backend (public, max-age=60) e por este estado local.
 *
 * Shape: horarios[{ dia, curto, aberto, abre, fecha }], locais[{ id, nome, endereco, ativo }].
 */
export function useConfig() {
  const [horarios, setHorarios] = useState([]);
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const cfg = await api.getConfig();
      setHorarios(Array.isArray(cfg?.horarios) ? cfg.horarios : []);
      setLocais(Array.isArray(cfg?.locais) ? cfg.locais : []);
    } catch (e) {
      setErro(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { horarios, locais, loading, erro, reload: carregar };
}
