# Architecture Map

## Camadas principais

1. **Interface (App Router)**
- Local: `src/app`
- Responsabilidade: páginas, layouts e route handlers

2. **Aplicação (Server Actions e serviços)**
- Local: `src/server`
- Responsabilidade: regras de negócio, orquestração e autorização de casos de uso

3. **Infra compartilhada**
- Local: `src/lib`
- Responsabilidade: auth (`next-auth`), prisma client, logging, utilidades e segurança

4. **Validação de entrada**
- Local: `src/schemas`
- Responsabilidade: schemas Zod para inputs de API, actions e formulários

5. **Persistência**
- Local: `prisma`
- Responsabilidade: schema, migrations e seed

## Fluxo padrão de request

1. Requisição entra em `src/app` (page/route/action)
2. Dados são validados por schema Zod
3. Regra de negócio executa em `src/server` (ou action específica)
4. Acesso ao banco ocorre via `src/lib/prisma`
5. Resposta retorna com payload mínimo e sem dados sensíveis

## Convenções adotadas

- Toda entrada externa deve ter validação explícita
- Toda rota sensível deve considerar rate limit
- Toda funcionalidade de debug deve ser bloqueada em produção sem token
- Server Actions e APIs não devem vazar detalhes internos em erro 500
- Código de produção não deve depender de bypass de build

## Organização recomendada para novas features

1. Criar schema em `src/schemas`
2. Implementar regra em `src/server`
3. Expor interface em `src/app` (page/action/route)
4. Adicionar testes e atualizar documentação

