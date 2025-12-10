# 🧩 Soft Delete de Usuários

Decisões e runbook para a implementação de soft delete e edição segura de usuários no Dashboard Admin (#024).

## Decisões de Modelo e Acesso
- `User` ganhou `deletedAt`, `deletedById`, `updatedById` e índices (`deletedAt`, `role+deletedAt`).
- Soft delete = `deletedAt` setado + `isActive=false`; restore limpa `deletedAt` e reativa.
- `buildUserWhere` no `UserService` exclui removidos por padrão; admins podem optar por `status: "ALL"`/`includeDeleted`.
- Autenticação/refresh de sessão ignoram usuários removidos (sessão é invalidada se o usuário estiver soft-deletado).
- Server Actions novas: `softDeleteUser`, `restoreUser`; `updateUser` e `createUser` passam a gravar `updatedById` e validam e-mails em contas removidas.

## Riscos e Mitigações
- **Reuso de email**: bloqueado enquanto a conta removida existir; mensagem orienta a restaurar ou usar outro email.
- **Acesso indevido**: `findFirst` + `deletedAt: null` em auth/profile/update; listagens públicas contam apenas ativos.
- **Observabilidade**: logs para create/update/delete/restore (logger central).

## Fluxo de Undo/Restore
- Remoção lógica via `softDeleteUser` (limpa tokens de reset/verificação).
- Restauração via `restoreUser` reativa `isActive` e zera `deletedAt`.

## Runbook de Migração
- Migration criada: `prisma/migrations/20251204120000_user_soft_delete/migration.sql`.
- Desenvolvimento: `npm run db:migrate` (ou `./scripts/docker-manager.sh migrate dev`).
- Seeds atualizados: `npm run db:seed` cria um exemplo removido (`removed@barbershop.com`).
- Rollback (manual): remover FKs `User_deletedById_fkey`/`User_updatedById_fkey`, dropar colunas e índices (`User_deletedAt_idx`, `User_role_deletedAt_idx`).
