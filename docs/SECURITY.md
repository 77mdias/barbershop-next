# Security Notes (Docker e Ambientes)

Este documento cobre apenas observações de segurança por ambiente.
Para checklist operacional completo, use: [security/PLAYBOOK.md](./security/PLAYBOOK.md).

## Desenvolvimento local (Docker)

- Ambiente destinado a máquina de desenvolvimento
- Banco e app expostos em portas locais para produtividade
- Nunca reutilizar este setup como produção

Comando oficial:

```bash
make dev-up
```

## Produção oficial (Vercel)

- Build de produção sem bypass por padrão
- Cookies e sessão sob configuração de produção do NextAuth
- Endpoints de debug/test devem permanecer bloqueados sem `DEBUG_API_TOKEN`

## Produção self-hosted (opcional)

Fluxo recomendado:

```bash
./scripts/deploy-pro.sh deploy
```

Convenção:

- `docker-compose.pro.yml`: ativo para self-hosted profissional
- `docker-compose.prod.yml`: legado/compatibilidade

## Regras rápidas

1. Não comitar segredos.
2. Não expor endpoints de debug em produção sem token forte.
3. Não habilitar `ALLOW_UNSAFE_BUILD` em produção.
4. Validar entrada externa com schema.
5. Aplicar migração de banco por fluxo controlado.

