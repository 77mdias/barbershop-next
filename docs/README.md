# Documentação do Projeto

Este diretório foi consolidado para reduzir duplicidade e eliminar conflito de comandos.

## Comece por aqui

1. [Runbook Operacional](./operations/RUNBOOK.md)
2. [Security Playbook](./security/PLAYBOOK.md)
3. [Architecture Map](./architecture/ARCHITECTURE-MAP.md)

## Regras oficiais de execução

- Desenvolvimento local: `make dev-up`
- Produção oficial: Vercel
- Migração de produção: `make prod-migrate-vercel`
- Docker self-hosted (opcional): `./scripts/deploy-pro.sh deploy`

## Estrutura da documentação

- `architecture/`: decisões e mapa arquitetural
- `operations/`: execução, troubleshooting e runbooks
- `security/`: baseline de segurança e hardening
- `features/`: visão funcional por módulo
- `database/`: guias de banco e Prisma
- `docker/`: documentação Docker (inclui material legado)
- `study/`: material de estudo/histórico

## Status de limpeza

- `README.md` (raiz) e este arquivo são fontes primárias.
- `docs/INDEX.md` é um índice curto para navegação rápida.
- Parte dos arquivos em `docker/` e `study/` permanece como legado técnico e histórico.

