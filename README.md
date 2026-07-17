# Summer Drinks — App do Cliente

PWA que o cliente final usa (cardápio, pedidos, agendamento de eventos).
Consome a **borda pública** do sistema de atendimento (`/public/:tenant/*`),
que é a fonte da verdade sobre preço, senha, status e disponibilidade.

## Repositórios do ecossistema
- **Este repo** (`SummerDrinks_Cliente`): PWA (`app-cliente/`) + patch de integração histórico (`app-cliente-patch/`) + documentação da ponte.
- **Backend**: [`Corrar/SummerDrinks_Atendimento`](https://github.com/Corrar/SummerDrinks_Atendimento) — atendimento (Node/Express/Postgres), migrations, borda pública, agenda, catálogo, config. Extraído deste monorepo preservando os 6 commits históricos (Fase 1 → Fase-config).

## Estrutura
```
SummerDrinks_Cliente/
├── MEGABRAIN-INTEGRACAO.md   ← LEIA PRIMEIRO: ACL, fluxos, trust model, plano
├── SECURITY-BORDA.md         ← threat model da borda pública + gate de segurança
├── .claude/skills/           ← acl-mapeamento, borda-resiliente
├── app-cliente/              ← PWA (React + Vite) — integração aplicada
│   └── src/{lib/{config,api,outbox}.js, hooks/{useMenu,useRemoteOrders}.js, ...}
└── app-cliente-patch/        ← drop-in histórico (referência do que foi aplicado no PWA)
    ├── APLICAR.md            ← diffs exatos (App.jsx, EventsScreen, EventConfirm)
    └── src/{lib/config.js, lib/api.js, lib/outbox.js, hooks/useMenu.js, hooks/useRemoteOrders.js}
```

## Subir o atendimento
```bash
git clone https://github.com/Corrar/SummerDrinks_Atendimento
cd SummerDrinks_Atendimento
cp .env.example .env      # DATABASE_URL, JWT_SECRET, CORS_ORIGINS (inclua a origem do app)
npm install
npm run migrate           # aplica 001..006
npm run dev               # porta 3000
```

## Subir o PWA
```bash
cd app-cliente
cp .env.example .env      # VITE_API_URL=http://localhost:3000, VITE_TENANT=summer
npm install
npm run dev
```

## O que a integração garante
- Senha **atômica do servidor** (fim da senha aleatória no browser).
- Pedido no **ledger do atendimento**, visível no PDV/Painel na hora.
- Evento **completo** virando agenda `solicitado`.
- Preço **re-precificado** no servidor (cliente não define dinheiro).
- **Idempotência** ponta-a-ponta + **outbox offline** (rede de trailer).
- PII protegida; borda com rate limit, zod e queries parametrizadas.

Verificação: backend (repo próprio) compila com `tsc --strict` limpo; PWA (`app-cliente/`) build verde no Vite (61 módulos, 213 KB / 64 KB gzip).
