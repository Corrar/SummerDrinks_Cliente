# Summer Drinks — Integração App do Cliente ↔ Atendimento

Conecta o **app do cliente** (PWA `summer-drinks-react`) ao **sistema de
atendimento** (backend + PDV/Painel/Agenda). O cliente faz pedidos e solicita
eventos; tudo cai no atendimento, em tempo real, com a operação como fonte da
verdade.

## Estrutura
```
summer-integracao/
├── MEGABRAIN-INTEGRACAO.md   ← LEIA PRIMEIRO: ACL, fluxos, trust model, plano
├── SECURITY-BORDA.md         ← threat model da borda pública + gate de segurança
├── .claude/skills/           ← acl-mapeamento, borda-resiliente
├── atendimento/              ← backend de atendimento + camada de integração (tsc --strict limpo)
│   ├── db/migrations/002_integracao.sql
│   └── src/{types/acl.ts, types/schemas-publicos.ts, services/EdgeIngestService.ts,
│            http/routes/public.ts (v2), realtime/io.ts, http/routes/orders.ts}
└── app-cliente-patch/        ← drop-in no app do cliente (não altera o visual)
    ├── APLICAR.md            ← diffs exatos (App.jsx, EventsScreen, EventConfirm)
    └── src/{lib/config.js, lib/api.js, lib/outbox.js, hooks/useMenu.js, hooks/useRemoteOrders.js}
```

## Subir o atendimento
```bash
cd atendimento
cp .env.example .env      # DATABASE_URL, JWT_SECRET, CORS_ORIGINS (inclua a origem do app)
npm install
npm run migrate           # aplica 001 + 002
npm run dev               # porta 3000
```

## Conectar o app do cliente
Siga `app-cliente-patch/APLICAR.md`. Resumo: copie os 5 arquivos, aplique os
diffs cirúrgicos, crie `.env` com `VITE_API_URL` e `VITE_TENANT`.

## O que a integração garante
- Senha **atômica do servidor** (fim da senha aleatória no browser).
- Pedido no **ledger do atendimento**, visível no PDV/Painel na hora.
- Evento **completo** virando agenda `solicitado`.
- Preço **re-precificado** no servidor (cliente não define dinheiro).
- **Idempotência** ponta-a-ponta + **outbox offline** (rede de trailer).
- PII protegida; borda com rate limit, zod e queries parametrizadas.

Verificação: `atendimento` compila com `tsc --strict` limpo; patch validado em ESM.
