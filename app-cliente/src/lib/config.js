/* Configuração da integração com o sistema de atendimento.
   Preferência: variável de ambiente Vite → localStorage → default de dev.
   Defina em produção via .env:  VITE_API_URL=...  VITE_TENANT=... */

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// Fallback quando VITE_API_URL não está definida: em build de produção usa o
// backend real (Render); em dev continua localhost. Env var sempre vence.
const API_DEFAULT = env.PROD
  ? 'https://summerdrinks-atendimento.onrender.com'
  : 'http://localhost:3000';

export const API_URL =
  env.VITE_API_URL ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('sd_api_url')) ||
  API_DEFAULT;

export const TENANT =
  env.VITE_TENANT ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('sd_tenant')) ||
  'summer';

export const base = () => `${API_URL}/public/${TENANT}`;
