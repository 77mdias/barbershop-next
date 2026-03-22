# Security Playbook

## Objetivo

Garantir um baseline de segurança operacional e de aplicação para o projeto.

## Baseline implementado

- Headers HTTP de segurança configurados em `next.config.mjs`
- CSP inicial habilitada (desativável apenas via `DISABLE_CSP_HEADER=1`)
- Build bypass inseguro desativado por padrão
- Endpoints de debug/test protegidos em produção por `DEBUG_API_TOKEN`
- Rate limit aplicado em endpoints sensíveis de autenticação
- Validação de payload de auth com schemas Zod

## Variáveis de ambiente críticas

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `DATABASE_URL`
- `DEBUG_API_TOKEN` (somente se debug endpoint precisar existir em produção)
- `ALLOW_UNSAFE_BUILD` (deve ficar ausente ou `0`)
- `DISABLE_CSP_HEADER` (deve ficar ausente ou `0`)

## Regras operacionais

1. Não expor tokens, sessão completa ou stack trace em respostas de API.
2. Não habilitar bypass de build em produção.
3. Não deixar debug endpoint aberto sem token forte.
4. Revisar logs para remover PII quando possível.
5. Sempre validar entrada externa com Zod (ou schema equivalente).

## Checklist de release

- [ ] `make quality-check` executado
- [ ] `make test` executado
- [ ] Variáveis de produção revisadas
- [ ] Endpoints de debug/test bloqueados em produção
- [ ] Migrações aplicadas com fluxo controlado

## Próxima fase recomendada

- Migrar rate limit de memória para backend distribuído (Redis/Upstash)
- Adicionar política de rotação de segredos
- Adicionar auditoria de dependências no CI (`npm audit` + SCA)
- Adicionar varredura de imagens Docker para self-hosted

