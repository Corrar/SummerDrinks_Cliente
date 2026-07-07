# Skill — Mapeamento ACL (app do cliente ↔ domínio)

Use quando for **adicionar ou alterar** uma tradução entre o app do cliente e o
sistema de atendimento.

## Onde mora
- Traduções puras: `atendimento/src/types/acl.ts`
- Validação da entrada externa: `atendimento/src/types/schemas-publicos.ts`
- Orquestração (I/O, re-precificação, escrita): `atendimento/src/services/EdgeIngestService.ts`

## Regras invioláveis
1. **Função pura primeiro.** Toda tradução nova é uma função sem I/O em `acl.ts`,
   testável isoladamente. I/O (SQL) só no `EdgeIngestService`.
2. **Servidor é dono do dinheiro.** Preço, senha, valor, total, status **nunca**
   vêm do cliente. Se a mudança fizer o cliente influenciar dinheiro → pare.
3. **Referência, não valor.** Item de pedido viaja como `id` de referência
   (`catalogoId__idx`), re-precificado no servidor. Nunca aceite `preco` do cliente.
4. **Falha fechada.** Entrada sem correspondência (item, tamanho, enum) → erro
   explícito (422/400), nunca um default silencioso que "chuta" um valor.
5. **Sanitize na borda.** Todo texto livre externo passa por `semHtml` no schema.
6. **PII não volta.** Se o campo novo é telefone/email/endereço, garanta que
   nenhuma rota GET pública o retorne e nenhum log o imprima.

## Receita para um campo novo
1. Adicionar ao `*PublicoSchema` (zod) com limite de tamanho + sanitização.
2. Se precisa de tradução (enum, formato), escrever função pura em `acl.ts`.
3. Mapear no `EdgeIngestService`; forçar server-side o que for sensível.
4. Se for persistir, migration **aditiva** (`ADD COLUMN IF NOT EXISTS`), nunca
   renomear coluna existente.
5. Atualizar a tabela em `MEGABRAIN-INTEGRACAO.md §2`.
6. `npx tsc --noEmit` limpo antes de commit.

## Anti-exemplos
- ❌ Ler `preco`/`senha`/`valor` do corpo do cliente.
- ❌ `default` que inventa preço quando o item não existe.
- ❌ Renomear campo de `domain.ts` (o PDV/Painel dependem dele).
