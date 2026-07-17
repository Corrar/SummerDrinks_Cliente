/* Configuração da integração com o sistema de atendimento.
   Preferência: variável de ambiente Vite → localStorage → default de dev.
   Defina em produção via .env:  VITE_API_URL=...  VITE_TENANT=... */

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const API_URL =
  env.VITE_API_URL ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('sd_api_url')) ||
  'http://localhost:3000';

export const TENANT =
  env.VITE_TENANT ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('sd_tenant')) ||
  'summer';

export const base = () => `${API_URL}/public/${TENANT}`;
