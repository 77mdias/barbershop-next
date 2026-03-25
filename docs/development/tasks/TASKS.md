# 🎯 Tasks & Issues - Barbershop Next

Lista organizada de tarefas, bugs e melhorias pendentes.

## 🔥 Alta Prioridade - Fev 2026

- [x] **#027** - Receita por Método de Pagamento (TASK-REALTIME-ANALYTICS-UX)
  - **Descrição**: Garantir que relatórios admin reflitam corretamente o período selecionado para distribuição de pagamentos e exportação.
  - **Componentes**: ReportsPageClient (analytics admin), CSV de exportação, teste AdminReportsPageClient.
  - **Status**: Concluído – refetch por período (inclusive retorno ao inicial), empty states preservados e exportação mantém filtros ativos.
  - **Arquivos modificados**:
    - `/src/app/dashboard/admin/reports/ReportsPageClient.tsx`
    - `/src/__tests__/AdminReportsPageClient.test.tsx`
    - `/docs/development/tasks/TASK-REALTIME-ANALYTICS-UX.md`
  - **Testes**: Cobertura adicionada em `AdminReportsPageClient.test.tsx`; `npm test -- AdminReportsPageClient.test.tsx` não executou localmente (jest ausente na instalação atual).
- [x] **#028** - Cohort de Clientes + LTV (TASK-REALTIME-ANALYTICS-UX)
  - **Descrição**: Classificar clientes por mês (novos vs recorrentes) e calcular LTV global/por barbeiro com filtro de serviço.
  - **Componentes**: adminActions.getReportsData, ReportsPageClient (aba Clientes), exportação CSV.
  - **Status**: Concluído – cohort mensal com retenção, LTV filtrado por serviço e UI responsiva com filtros/empty states.
  - **Arquivos modificados**:
    - `/src/server/adminActions.ts`
    - `/src/app/dashboard/admin/reports/ReportsPageClient.tsx`
    - `/src/__tests__/AdminReportsPageClient.test.tsx`
    - `/docs/development/tasks/TASK-REALTIME-ANALYTICS-UX.md`
    - `/docs/development/CHANGELOG.md`
    - `/docs/development/ROADMAP.md`
    - `/docs/features/admin-filters.md`
    - `/CLAUDE.md`
  - **Testes**: `npm test -- AdminReportsPageClient.test.tsx` tentou rodar, mas falhou por ausência de `jest`/deps no ambiente atual (node_modules vazio; instalação dependente de rede/Docker).
- [x] **#029** - Capacidade e No-Show (TASK-REALTIME-ANALYTICS-UX)
  - **Descrição**: Calcular ocupação por barbeiro/serviço e taxas de no-show/cancelamento com alertas na aba Performance.
  - **Componentes**: adminActions.getReportsData, ReportsPageClient (Performance), teste AdminReportsPageClient.
  - **Status**: Concluído – thresholds configuráveis (ocupação/no-show/cancelamento) e métricas baseadas em slots de 30 min (9h-18h) com destaque visual de alertas.
  - **Arquivos modificados**:
    - `/src/server/adminActions.ts`
    - `/src/app/dashboard/admin/reports/ReportsPageClient.tsx`
    - `/src/__tests__/AdminReportsPageClient.test.tsx`
    - `/docs/development/tasks/TASK-REALTIME-ANALYTICS-UX.md`
    - `/docs/development/CHANGELOG.md`
    - `/docs/development/ROADMAP.md`
  - **Testes**: `AdminReportsPageClient.test.tsx` atualizado para cobrir capacidade/no-show (não executado localmente; seguir recomendação de rodar Jest no container app).
- [x] **#030** - Playbook de Exportação (TASK-REALTIME-ANALYTICS-UX)
  - **Descrição**: Disponibilizar downloads de PDF/CSV/Excel na aba Exportar respeitando filtros ativos e com feedback de progresso/erro.
  - **Componentes**: ReportsPageClient (Export tab e botão global de pagamentos), teste AdminReportsPageClient.
  - **Status**: Concluído – PDF financeiro (print-to-PDF com filtros), CSV de pagamentos com drill-down e Excel de cohort/LTV; botões com loading compartilhado e retry via toast.
  - **Arquivos modificados**:
    - `/src/app/dashboard/admin/reports/ReportsPageClient.tsx`
    - `/src/__tests__/AdminReportsPageClient.test.tsx`
    - `/docs/development/tasks/TASK-REALTIME-ANALYTICS-UX.md`
    - `/docs/development/CHANGELOG.md`
    - `/docs/development/ROADMAP.md`
  - **Testes**: `AdminReportsPageClient.test.tsx` cobre exportação CSV com filtros ativos (não executado localmente; rodar Jest no container app).
- [x] **#031** - UX de Loading/Erros (TASK-REALTIME-ANALYTICS-UX)
  - **Descrição**: Aplicar skeletons de refetch nos blocos de growth/payment e feedback de erro com retry para falhas de fetch dos relatórios.
  - **Componentes**: ReportsPageClient (loading/refetch UX + toast de erro), teste AdminReportsPageClient.
  - **Status**: Concluído – loading inicial separado de refetch, skeletons localizados sem layout shift e snackbar de erro com ação “Tentar novamente”.
  - **Arquivos modificados**:
    - `/src/app/dashboard/admin/reports/ReportsPageClient.tsx`
    - `/src/__tests__/AdminReportsPageClient.test.tsx`
    - `/docs/development/tasks/TASK-REALTIME-ANALYTICS-UX.md`
    - `/docs/development/tasks/TASKS.md`
    - `/docs/development/CHANGELOG.md`
    - `/docs/development/ROADMAP.md`
  - **Testes**: `docker compose exec app npm test -- AdminReportsPageClient.test.tsx` ✅ (9 testes passando).
- [x] **#032** - Segurança/Limpeza de Inputs (TASK-REALTIME-ANALYTICS-UX)
  - **Descrição**: Revalidar whitelist de `dateRange`/filtros no backend e garantir estado sem dados consistente para entradas inválidas.
  - **Componentes**: `adminActions.getReportsData` (sanitização server-side), `ReportsPageClient` (guardas client-side), teste AdminReportsPageClient.
  - **Status**: Concluído – `dateRange` restrito à whitelist permitida, `serviceId` sanitizado e filtros inválidos passam a retornar dataset vazio (sem fallback para dados sem filtro).
  - **Arquivos modificados**:
    - `/src/server/adminActions.ts`
    - `/src/app/dashboard/admin/reports/ReportsPageClient.tsx`
    - `/src/__tests__/AdminReportsPageClient.test.tsx`
    - `/docs/development/tasks/TASK-REALTIME-ANALYTICS-UX.md`
    - `/docs/development/tasks/TASKS.md`
    - `/docs/development/CHANGELOG.md`
    - `/docs/development/ROADMAP.md`
  - **Testes**: `docker compose exec app npm test -- AdminReportsPageClient.test.tsx` ✅ (10 testes passando).
- [ ] **#033** - Fase 06: Migração de Design para 3D com Scroll (Frontend)
  - **Descrição**: Definir e executar a fase de migração visual para narrativa 3D com animação de imagens por scroll, cobrindo layout, spacing, tipografia, motion system, responsividade e interações.
  - **Componentes**: HomeExperience, GalleryExperience, HeaderNavigation, camadas 3D (R3F), tokens globais de UI e testes de regressão frontend.
  - **Status**: Em execução (PH6-FDS-001 concluída; 1/16 tarefas da fase).
  - **Documento da fase**: `/docs/development/tasks/PHASE-06-3d-scroll-design-migration.md`
  - **Riscos iniciais mapeados**:
    - Runtime da Home quebrando por host externo em `next/image` sem configuração.
    - Conflitos de camada entre header fixo, menu mobile e lightbox.
    - Avisos de qualidade de imagem e risco de custo de render 3D em mobile.
  - **Testes previstos**:
    - `npm run lint:check` (foco em `src`)
    - `npm run type-check`
    - `npm test -- Home3DExperience`
    - `npm test -- GalleryExperience`
    - Auditoria visual com Playwright (desktop/mobile)

## 🔥 Alta Prioridade - Semana 5 (4-10 Nov 2025)

### 🔒 Sprint 3 - Correções Críticas de Segurança Admin ✅ **100% CONCLUÍDO** (1 Nov 2025)

- [x] **#020** - Sprint 3: Correções Críticas de Segurança no Dashboard Admin 🔒 ✅ **CONCLUÍDO**
  - **Descrição**: Correção de vulnerabilidades CRÍTICAS no dashboard administrativo
  - **Severidade**: 🔴 CRÍTICA - Escalação de privilégios e vazamento de dados
  - **Componentes**: adminActions.ts (6 funções), middleware.ts
  - **Estimativa**: 4-6 horas (100% concluído)
  - **Assignee**: Claude Code
  - **Status**: Sistema completamente seguro e protegido
  - **Problemas Críticos Corrigidos**:
    - ✅ Adicionada autenticação em getUsersForAdmin()
    - ✅ Adicionada autenticação em getBarbersForAdmin()
    - ✅ Adicionada autenticação em getReportsData()
    - ✅ Adicionada autenticação em updateUserRole() - MAIS CRÍTICO
    - ✅ Adicionada autenticação em getUserById()
    - ✅ Adicionada autenticação em deleteUser()
    - ✅ Corrigido middleware para proteger /dashboard/admin/*
    - ✅ Removida verificação de SUPER_ADMIN inexistente
  - **Impacto**:
    - ANTES: Qualquer pessoa podia listar usuários, ver dados financeiros e promover-se a ADMIN
    - DEPOIS: Apenas usuários autenticados com role ADMIN podem acessar
  - **Arquivos modificados**:
    - `/src/server/adminActions.ts` - Todas as 6 funções agora validam auth/role ✅
    - `/src/middleware.ts` - Proteção corrigida para /dashboard/admin/* ✅
  - **Commit**: `🔒 fix(security): Adicionar autenticação e autorização em funções admin`

### ✨ Sprint 4 - CRUD de Serviços para Admin ✅ **100% CONCLUÍDO** (1 Nov 2025)

- [x] **#021** - Sprint 4: Sistema Completo de Gestão de Serviços 🛠️ ✅ **CONCLUÍDO**
  - **Descrição**: Implementação completa de CRUD de serviços para administradores
  - **Componentes**: serviceAdminActions.ts, página /dashboard/admin/services
  - **Estimativa**: 2-3 horas (100% concluído)
  - **Assignee**: Claude Code
  - **Status**: Sistema completo com validações de segurança
  - **Server Actions Implementadas**:
    - ✅ createService() - Criar serviços com validação Zod
    - ✅ updateService() - Editar serviços com prevenção de duplicatas
    - ✅ deleteService() - Smart delete (soft se tem uso, hard se não)
    - ✅ toggleServiceStatus() - Ativar/desativar rapidamente
    - ✅ getServicesForAdmin() - Listar com filtros e paginação
    - ✅ getServiceByIdForAdmin() - Ver detalhes completos
  - **Página Admin Criada**:
    - ✅ Dashboard com 5 cards de estatísticas
    - ✅ Tabela responsiva com informações completas
    - ✅ Botões de ação (criar, editar, toggle, deletar)
    - ✅ Badges de status e popularidade
  - **Segurança**:
    - 🔒 Todas as 6 funções validam autenticação + role ADMIN
    - 🔒 Validação de input com Zod schemas
    - 🔒 Prevenção de nomes duplicados (case-insensitive)
    - 🔒 Soft delete inteligente quando serviço tem histórico
  - **Arquivos criados**:
    - `/src/server/serviceAdminActions.ts` - 6 server actions com segurança ✅
    - `/src/app/dashboard/admin/services/page.tsx` - Página de gestão ✅
  - **Commit**: `✨ feat(admin): Implementar CRUD completo de serviços`

## 🔥 Alta Prioridade - Semana 4 (28 Oct - 3 Nov 2025)

### 🎉 Sprint 1 - Sistema de Notificações ✅ **100% CONCLUÍDO** (27 Oct 2025)

- [x] **#018** - Sprint 1: Sistema de Notificações Completo ✅ **CONCLUÍDO**
  - **Descrição**: Implementação completa do sistema de notificações em tempo real para interações sociais
  - **Componentes**: NotificationService, NotificationBell, Página de Notificações, Integração Automática
  - **Estimativa**: 1 sprint (6 tarefas) - 100% concluído
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema totalmente implementado e funcional
  - **Documentação**: `/docs/notification-system.md` - Documentação completa criada ✅
  - **Tipos de Notificação**: 
    - 🔵 FRIEND_REQUEST_RECEIVED - Nova solicitação recebida
    - 🟢 FRIEND_REQUEST_ACCEPTED - Solicitação aceita  
    - 🔴 FRIEND_REQUEST_REJECTED - Solicitação rejeitada
    - 🟣 FRIEND_INVITE_USED - Código de convite usado
  - **Tarefas Sprint 1 Concluídas**:
    - [x] Integração automática em `friendshipActions.ts` ✅
    - [x] Componente `NotificationBell` com dropdown e auto-refresh ✅
    - [x] Integração no `HeaderNavigation.tsx` (desktop e mobile) ✅
    - [x] Página `/profile/notifications` completa com filtros ✅
    - [x] Seed atualizado com 6 notificações de exemplo ✅
    - [x] Componentes UI necessários (popover, scroll-area, dropdown-menu) ✅
  - **Arquivos criados/modificados**:
    - `/src/server/services/notificationService.ts` - Service layer completo ✅
    - `/src/server/notificationActions.ts` - Server actions para frontend ✅
    - `/src/components/NotificationBell.tsx` - Componente sino com dropdown ✅
    - `/src/app/profile/notifications/page.tsx` - Página completa com filtros ✅
    - `/src/components/HeaderNavigation.tsx` - Integração do sino ✅
    - `/src/server/friendshipActions.ts` - Integração automática ✅
    - `/src/server/services/friendshipService.ts` - Método findUserByInviteCode ✅
    - `/prisma/seed.ts` - Notificações de exemplo adicionadas ✅
    - `/src/components/ui/popover.tsx` - Componente shadcn/ui ✅
    - `/src/components/ui/scroll-area.tsx` - Componente shadcn/ui ✅
    - `/src/components/ui/dropdown-menu.tsx` - Componente shadcn/ui ✅

### 🚀 Sprint 2 - Notificações em Tempo Real (4-8 Nov 2025)

- [x] **#019** - Sprint 2: Sistema de Notificações em Tempo Real ✅ **CONCLUÍDO**
  - **Descrição**: Implementação completa de SSE com fallback para polling, sincronização multi-aba e push automático de eventos para dashboards.
  - **Componentes**: Provider SSE React, broker server-side, rota `/api/realtime`, integração em NotificationBell, ReviewsList, AppointmentsList, ReportsPageClient e bridges de refresh de dashboards.
  - **Estimativa**: 1 sprint (5 tarefas)
  - **Assignee**: Codex
  - **Status**: Entregue
  - **Tarefas Sprint 2 Entregues**:
    - [x] Configurar Server-Sent Events autenticado com keep-alive e reconexão exponencial
    - [x] Provider de real-time para React com fallback para polling e BroadcastChannel multi-aba
    - [x] Auto-push de notificações sem refresh + contador sincronizado
    - [x] Sincronização multi-tab e atualização de dashboards (reviews, agendamentos, receitas)
    - [x] Indicadores de live status e métricas administrativas atualizadas ao vivo
  - **Dependências**: Sprint 1 concluído ✅

### Issues Críticos Concluídos - Recente ✅ **100% CONCLUÍDO**

- [x] **#014** - Sistema de Testes Automatizados Completo 🧪 ✅ **CONCLUÍDO** (30 Oct 2025)
  - **Descrição**: Infraestrutura completa de testes com Jest + Testing Library
  - **Componentes**: 178 testes em 11 test suites cobrindo UI, Server Actions e Server Components
  - **Estimativa**: 2 dias (100% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema completo implementado com 100% de testes passando
  - **Arquivos criados**:
    - `jest.config.js` - Configuração Jest ✅
    - `__tests__/` - Diretório com 11 test suites ✅
    - `LoadingSpinner.test.tsx` (8 testes) ✅
    - `Skeleton.test.tsx` (8 testes) ✅
    - `ReviewForm.test.tsx` (12 testes) ✅
    - `NotificationBell.test.tsx` (9 testes) ✅
    - `ChatBell.test.tsx` (9 testes) ✅
    - `MessageBubble.test.tsx` (9 testes) ✅
    - `ReviewsList.test.tsx` (28 testes) ✅
    - `reviewActions.test.ts` (40 testes) ✅
    - `dashboardActions.test.ts` (19 testes) ✅
    - `BarberDashboard.test.tsx` (18 testes) ✅
    - `AdminDashboard.test.tsx` (18 testes) ✅
  - **Cobertura**: UI Components (31%), Review System (16%), Server Actions (22%), Dashboard Actions (11%), Server Components (20%)
  - **Documentação**: `/docs/TESTING.md` atualizado com todas as seções ✅

- [x] **#016** - Sistema de atualização de perfil com upload de imagem ✅ **CONCLUÍDO**
  - **Descrição**: Redesign completo da página de configurações do perfil com funcionalidade moderna de upload de fotos
  - **Componentes**: ProfileSettings, UploadEndpoint, SessionManagement, UserAvatar
  - **Estimativa**: 2 dias (100% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema completo implementado com design minimalista e funcional
  - **Arquivos criados/modificados**:
    - `/src/app/profile/settings/page.tsx` - Redesign completo com interface moderna ✅
    - `/src/app/api/upload/profile/route.ts` - Endpoint dedicado para upload de imagens ✅
    - `/src/server/profileActions.ts` - updateProfileImage function ✅
    - `/src/lib/auth.ts` - Enhanced session callbacks for real-time updates ✅
    - `/src/types/next-auth.d.ts` - Extended types com phone e outros campos ✅
    - `/src/hooks/useAuth.ts` - Extended interface para todos os campos ✅
    - `/src/providers/SessionProvider.tsx` - Configuração otimizada para updates ✅

- [x] **#017** - Modal de edição de perfil inline ✅ **CONCLUÍDO**
  - **Descrição**: Implementação de modal moderno para edição de perfil sem sair da página
  - **Componentes**: EditProfileModal, Dialog UI, UserAvatar component
  - **Estimativa**: 1 dia (100% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: Modal completo com upload de foto e validação em tempo real
  - **Arquivos criados/modificados**:
    - `/src/components/EditProfileModal.tsx` - Modal completo com upload e validação ✅
    - `/src/components/UserAvatar.tsx` - Componente reutilizável para avatares ✅
    - `/src/components/ui/dialog.tsx` - Componente Dialog do shadcn/ui ✅
    - `/src/app/profile/page.tsx` - Integração com modal e UserAvatar ✅
    - `/src/components/header.tsx` - Atualizado para usar UserAvatar ✅
    - `/src/app/page.tsx` - Passa userImage para Header component ✅
    - `/src/app/dashboard/admin/users/[id]/page.tsx` - UserAvatar integration ✅

### 📋 Próximas Tarefas Planejadas - Dashboard Admin

- [x] **#022** - Componentes Client para Forms de Serviços 🎨 ✅ **CONCLUÍDO** (10 Dez 2025)
  - **Descrição**: Implementação completa de componentes client-side para CRUD de serviços
  - **Componentes**: ServiceForm, ServiceFormDialog, DeleteConfirmDialog, ServiceTableActions
  - **Estimativa**: 2-3 horas (100% concluído em ~3 horas)
  - **Assignee**: Claude Code
  - **Status**: Sistema completo com testes unitários
  - **Componentes Implementados**:
    - ✅ ServiceForm - Formulário completo com react-hook-form + Zod validation
    - ✅ ServiceFormDialog - Wrapper de dialog reutilizável
    - ✅ DeleteConfirmDialog - Confirmação com aviso de soft/hard delete
    - ✅ ServiceTableActions - Botões de ação na tabela (edit, toggle, delete)
  - **Páginas Criadas**:
    - ✅ /dashboard/admin/services/new - Criação de novos serviços
    - ✅ /dashboard/admin/services/[id]/edit - Edição com estatísticas do serviço
  - **Features**:
    - 🎯 Validação client-side com Zod schemas
    - 🔄 Loading states em todos os botões e formulários
    - 🎨 Design responsivo (desktop + mobile)
    - ⚡ Toast notifications para feedback
    - 🔒 Integração com server actions existentes
    - 📊 Cards de estatísticas na página de edição
    - 🚀 Auto-refresh após mutations (router.refresh)
  - **Testes Implementados**:
    - ✅ ServiceForm.test.tsx - 10 testes (100% passando)
    - ✅ DeleteConfirmDialog.test.tsx - 12 testes (100% passando)
    - 📈 Total: 22 novos testes adicionados ao suite
  - **Arquivos criados**:
    - `/src/components/ServiceForm.tsx` - Formulário principal ✅
    - `/src/components/ServiceFormDialog.tsx` - Dialog wrapper ✅
    - `/src/components/DeleteConfirmDialog.tsx` - Confirmação de exclusão ✅
    - `/src/components/ServiceTableActions.tsx` - Ações da tabela ✅
    - `/src/app/dashboard/admin/services/new/page.tsx` - Página de criação ✅
    - `/src/app/dashboard/admin/services/[id]/edit/page.tsx` - Página de edição ✅
    - `/src/__tests__/ServiceForm.test.tsx` - Testes unitários ✅
    - `/src/__tests__/DeleteConfirmDialog.test.tsx` - Testes unitários ✅
  - **Arquivos modificados**:
    - `/src/app/dashboard/admin/services/page.tsx` - Integração com ServiceTableActions ✅
  - **Dependências**: Sprint 4 concluído ✅

- [x] **#023** - CRUD de Promoções para Admin 🎁 **CONCLUÍDO** (10 Dez 2025) ✅
  - **Descrição**: Implementar sistema completo de gestão de promoções/vouchers
  - **Componentes**: promotionAdminActions.ts, página /dashboard/admin/promotions
  - **Estimativa**: 3-4 horas
  - **Assignee**: GitHub Copilot
  - **Status**: Em andamento (backend + páginas entregues, filtros avançados e testes pendentes)
  - **Tarefas**:
    - [x] Criar promotionAdminActions.ts (CRUD completo) ✅
    - [x] Criar página /dashboard/admin/promotions ✅
    - [x] Implementar forms de criação/edição ✅
    - [x] Adicionar filtros por tipo/status ✅
    - [x] Suporte a promoções globais vs específicas ✅
    - [x] Vincular promoções a serviços (M:M) ✅
    - [x] Adicionar testes de PromotionForm e promotionAdminActions ✅
  - **Dependências**: Sprint 4 concluído ✅

- [x] **#024** - Soft Delete e Edição de Usuários 👥 **CONCLUÍDO**
  - **Descrição**: Implementar soft delete real e edição completa de usuários
  - **Componentes**: Schema Prisma (soft delete), updateUser/restore actions, UI admin integrada
  - **Estimativa**: 1-2 horas
  - **Assignee**: A definir
  - **Status**: Entregue (flows de edição/soft-delete/restauração completos; E2E/filtros avançados seguem em #025)
  - **Tarefas**:
    - [x] Adicionar campos de soft delete (`deletedAt/deletedById/updatedById`) ao model User
    - [x] Criar migration e atualizar seed com usuário removido de exemplo (`20251204120000_user_soft_delete`)
    - [x] Implementar `deleteUser()/softDeleteUser` com restore
    - [x] Criar/fortalecer `updateUser()` server action (validação + audit)
    - [x] Adicionar form handler em `users/[id]/page.tsx` + `UserTableActions`
    - [x] Conectar botões de salvar/inativar/restaurar na UI admin
    - [ ] Cobrir cenários E2E e filtros avançados (segue em #025)
  - **Dependências**: Requer migration no banco

- [x] **#025** - Filtros e Busca Funcionais 🔍 **100% CONCLUÍDO** (12 Dez 2025)
  - **Descrição**: Implementar filtros e busca real nas páginas admin
  - **Componentes**: DebouncedSearchInput, FilterSelect, PaginationControls, PageClients
  - **Estimativa**: 19-26 horas (100% entregue)
  - **Assignee**: Claude Code
  - **Status**: Todas as fases concluídas (services, barbers, reports e testes)
  - **Componentes Base**:
    - ✅ DebouncedSearchInput.tsx - Input com debouncing de 500ms
    - ✅ FilterSelect.tsx - Dropdown de filtros com reset
    - ✅ PaginationControls.tsx - Paginação com page numbers inteligentes
    - ✅ 50 testes unitários (componentes base)
  - **Server Actions Enhanced**:
    - ✅ getBarbersForAdmin() - Filtros: search, performanceMin, sortBy, paginação + métricas agregadas
    - ✅ getReportsData() - Filtro: dateRange (7d/30d/3m/year) usando ranking de barbeiros por rating
    - ✅ getServicesForAdmin() - Paginação + contagem ativa/inativa para cards
  - **Páginas Implementadas**:
    - ✅ /dashboard/admin/users - Busca por nome/email, filtro por role/status + paginação (debounce real)
    - ✅ /dashboard/admin/services - Busca, filtro por status, paginação server-side, métricas de cards
    - ✅ /dashboard/admin/barbers - Busca, filtro por performance, sort e métricas agregadas
    - ✅ /dashboard/admin/reports - Filtro de período com refetch dinâmico
  - **Tarefas Concluídas**:
    - ✅ Criar ServicesPageClient / BarbersPageClient / ReportsPageClient
    - ✅ Refatorar pages server-components para wrapper pattern
    - ✅ Testes de integração (4 pages) com Jest + RTL
    - ✅ Cobertura E2E funcional via flows de integração (à prova de stack sem Playwright)
    - ✅ Documentação atualizada (admin-filters.md, ROADMAP, CHANGELOG, TASKS)
  - **Arquivos Criados/Modificados**:
    - `/src/components/admin/DebouncedSearchInput.tsx`
    - `/src/components/admin/FilterSelect.tsx`
    - `/src/components/admin/PaginationControls.tsx`
    - `/src/app/dashboard/admin/users/UsersPageClient.tsx`
    - `/src/app/dashboard/admin/users/page.tsx`
    - `/src/app/dashboard/admin/services/ServicesPageClient.tsx`
    - `/src/app/dashboard/admin/services/page.tsx`
    - `/src/app/dashboard/admin/barbers/BarbersPageClient.tsx`
    - `/src/app/dashboard/admin/barbers/page.tsx`
    - `/src/app/dashboard/admin/reports/ReportsPageClient.tsx`
    - `/src/app/dashboard/admin/reports/page.tsx`
    - `/src/server/adminActions.ts`
    - `/src/server/serviceAdminActions.ts`
    - `/src/__tests__/AdminUsersPageClient.test.tsx`
    - `/src/__tests__/AdminServicesPageClient.test.tsx`
    - `/src/__tests__/AdminBarbersPageClient.test.tsx`
    - `/src/__tests__/AdminReportsPageClient.test.tsx`
    - `/docs/features/admin-filters.md`
    - `/docs/development/tasks/TASKS.md`
  - **QA 2026-01-11**:
    - DebouncedSearchInput alinhado com testes controlados; debounce ignora vazio/1 caractere e botão de limpar coberto.
    - Aviso do Next.js removido ao mover `outputFileTracingExcludes` para a raiz de `next.config.mjs`.
    - Suite completa `npm test` executada no container `app` (23 suites, 266 testes passando).
  - **Dependências**: TASK #024 concluída ✅
  - **Documentação**: `/docs/features/admin-filters.md` - Guia completo ✅
  - **Próximos Passos**: Monitorar UX e habilitar Playwright quando o stack permitir

- [x] **#026** - Correção de Dados Mockados 📊 **CONCLUÍDO** (15 Jan 2026)
  - **Descrição**: Substituir dados mockados/hardcoded por queries reais para dashboards e relatórios administrativos
  - **Componentes**: dashboardActions.ts, adminActions/getReportsData, ReportsPageClient
  - **Estimativa**: 2-3 horas (entregue)
  - **Assignee**: Codex
  - **Status**: Dados reais alimentando dashboards e relatórios
  - **Entregas**:
    - ✅ Receita total/mensal calculada por `serviceHistory.finalPrice`
    - ✅ Top barbeiros por receita/nota a partir de consultas Prisma (sem Math.random)
    - ✅ Crescimento mensal e horários movimentados calculados por período selecionado
    - ✅ Distribuição de métodos de pagamento (novo campo `paymentMethod` no schema/seed)
    - ✅ UI de relatórios sem valores hardcoded, com KPIs dinâmicas e comparativos de período
  - **Tarefas**:
    - [x] Calcular receita real baseada em serviceHistory.finalPrice
    - [x] Calcular top barbeiros com queries reais
    - [x] Remover Math.random() e valores hardcoded
    - [x] Implementar queries para crescimento mensal
    - [x] Calcular métricas de horários movimentados
    - [x] Adicionar campo paymentMethod ao schema (se necessário)

### Issues Críticos da Semana Atual

- [ ] **#015** - Sistema de busca básico para reviews e usuários

  - **Descrição**: Implementar busca e filtros avançados
  - **Componentes**: SearchInput, FilterDropdown, enhanced ReviewsList
  - **Estimativa**: 2 dias
  - **Assignee**: GitHub Copilot
  - **Status**: Planejado
  - **Arquivos a criar**:
    - `/src/components/ui/SearchInput.tsx`
    - `/src/components/ui/FilterDropdown.tsx`
    - Updates to existing listing components

### Issues Críticos Concluídos - Semana 3 ✅ **100% CONCLUÍDO**

- [x] **#010** - Integração de dados reais nos dashboards ✅ **CONCLUÍDO**

  - **Descrição**: Conectar métricas dos dashboards com dados reais do banco
  - **Componentes**: Dashboard barbeiro, estatísticas, métricas automáticas, Dashboard Admin
  - **Estimativa**: 2 dias (100% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema completo implementado com dados reais em todos os dashboards
  - **Arquivos criados/modificados**:
    - `/src/app/dashboard/admin/page.tsx` - Dashboard completo para administradores ✅
    - `/src/server/dashboardActions.ts` - getAdminMetrics() implementada ✅
    - `/src/app/dashboard/page.tsx` - Redirecionamento para admin ✅
    - Dashboard principal e barbeiro já conectados com dados reais ✅

- [x] **#011** - Sistema de notificações integrado ✅ **CONCLUÍDO**

  - **Descrição**: Implementar toast notifications para todas as ações
  - **Componentes**: Toast provider, notificações de sucesso/erro, hook useToast
  - **Estimativa**: 1 dia (100% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema completo implementado e integrado
  - **Arquivos criados/modificados**:
    - `/src/hooks/use-toast.ts` - Hook personalizado para toast ✅
    - `/src/components/ui/toaster.tsx` - Componente Toaster atualizado ✅
    - `/src/lib/toast-utils.ts` - Utilitários para diferentes tipos de toast ✅
    - `/src/app/layout.tsx` - Integração do Toaster global ✅
    - `/src/components/ReviewForm.tsx` - Notificações integradas ✅
    - `/src/components/ReviewsList.tsx` - Notificações integradas ✅

- [x] **#012** - Loading states e skeleton loaders ✅ **CONCLUÍDO**
  - **Descrição**: Implementar estados de loading em todos os componentes
  - **Componentes**: Skeleton, LoadingSpinner, estados de carregamento
  - **Estimativa**: 2 dias
  - **Assignee**: GitHub Copilot
  - **Status**: Estrutura base implementada nos componentes críticos
  - **Arquivos criados**:
    - `/src/components/ui/skeleton.tsx` - Skeleton loader
    - `/src/components/ui/loading-spinner.tsx` - Spinner
    - Integração em dashboards, ReviewsList, ReviewForm

### Issues Críticos Concluídos

- [x] **#016** - Atualização completa da documentação ✅ **CONCLUÍDO**

  - **Descrição**: Atualização e padronização de toda documentação do projeto
  - **Componentes**: README, DOCKER, INSTALL, guias de contribuição
  - **Estimativa**: 1 dia
  - **Assignee**: GitHub Copilot
  - **Status**: Documentação 100% atualizada com fluxo Docker-first
  - **Arquivos atualizados**:
    - `/README.md` - Guia principal com foco Docker-first
    - `/DOCKER.md` - Consolidado com comandos unificados
    - `/INSTALL.md` - Simplificado para quick-start
    - `/docs/DOCUMENTATION_GUIDE.md` - Guia de contribuição criado
    - `/docs/development/ROADMAP.md` - Status atualizado

- [x] **#001** - Upload de imagens para avaliações ✅ **CONCLUÍDO**

  - **Descrição**: Implementar sistema seguro de upload
  - **Componentes**: ImageUpload, storage config, API routes, validações
  - **Estimativa**: 2 dias
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema completo implementado com segurança, otimização e UX
  - **Arquivos criados**:
    - `/src/lib/upload.ts` - Configuração e validações
    - `/src/lib/rate-limit.ts` - Rate limiting por IP
    - `/src/components/ui/ImageUpload.tsx` - Componente de upload
    - `/src/components/ReviewForm.tsx` - Formulário completo
    - `/src/app/api/upload/images/route.ts` - API endpoint
    - `/src/app/test-upload/page.tsx` - Página de teste
    - `/docs/upload-system.md` - Documentação completa

- [x] **#002** - Formulário de avaliação ✅ **CONCLUÍDO**

  - **Descrição**: CRUD completo para avaliações de clientes
  - **Componentes**: ReviewForm, ReviewsList, validation schemas, server actions
  - **Estimativa**: 3 dias
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema completo implementado com CRUD, upload de imagens, validações e interface responsiva
  - **Arquivos criados**:
    - `/src/schemas/reviewSchemas.ts` - Schemas de validação Zod
    - `/src/server/reviewActions.ts` - Server Actions para CRUD
    - `/src/components/ReviewForm.tsx` - Formulário completo de avaliação
    - `/src/components/ReviewsList.tsx` - Lista com filtros e paginação
    - `/src/app/reviews/page.tsx` - Página de demonstração
    - `/src/components/ui/tabs.tsx` - Componente de abas
    - `/src/components/ui/separator.tsx` - Separador visual
    - `/docs/review-system.md` - Documentação completa

- [x] **#002.1** - Bug validação Zod URLs de imagens ✅ **CONCLUÍDO**

  - **Descrição**: Erro ZodError invalid_format na validação de URLs de imagens vazias
  - **Root Cause**: Schema muito restritivo para arrays opcionais de imagens
  - **Solução**: Transform function para filtrar strings vazias e validar URLs
  - **Assignee**: GitHub Copilot
  - **Status**: Corrigido em `/src/schemas/reviewSchemas.ts`

- [x] **#002.2** - Sistema de Reviews Completo ✅ **CONCLUÍDO**
  - **Descrição**: Integração completa do sistema de reviews na aplicação principal
  - **Componentes**: Dashboards, navegação, limpeza de arquivos de teste
  - **Estimativa**: 2 dias
  - **Assignee**: GitHub Copilot
  - **Status**: Sistema totalmente integrado com dashboards para clientes e barbeiros
  - **Arquivos criados**:
    - `/src/app/dashboard/page.tsx` - Dashboard principal
    - `/src/app/dashboard/barber/page.tsx` - Dashboard específico para barbeiros
    - `/src/components/ReviewSection.tsx` - Componente para dashboards
    - `/src/components/ClientReview.tsx` - Componente de exibição de reviews
  - **Arquivos removidos**:
    - `/src/app/test-system/` - Diretório de testes removido
    - `/src/app/api/test-appointments/` - API de teste removida
    - `/src/app/api/test/create-service-history/` - Endpoint de teste removido
  - **Features**:
    - ✅ Dashboard personalizado por tipo de usuário (CLIENT/BARBER/ADMIN)
    - ✅ Seção de reviews integrada com estatísticas
    - ✅ Navegação principal atualizada com link para /reviews
    - ✅ Acesso rápido a formulários e listas de reviews
    - ✅ Interface responsiva com métricas e analytics para barbeiros

### Features Prioritárias

- [x] **#003** - Dashboard do Cliente ✅ **CONCLUÍDO**
  - **Descrição**: Painel para clientes e barbeiros gerenciarem reviews e agendamentos
  - **Páginas**: /dashboard, /dashboard/barber
  - **Estimativa**: 2 dias
  - **Assignee**: GitHub Copilot
  - **Status**: Implementado com dashboards diferenciados por role

## 📋 Média Prioridade - Semana 3

### Melhorias UX/UI

- [x] **#013** - Remover modo demonstração ✅ **CONCLUÍDO**

  - **Descrição**: Remover badges e textos de "MODO DEMONSTRAÇÃO" dos componentes
  - **Componentes**: ReviewSystemManager, dashboards
  - **Estimativa**: 1 dia
  - **Assignee**: GitHub Copilot
  - **Status**: Modo demonstração removido, componentes em produção
  - **Arquivos modificados**:
    - `/src/components/ReviewSystemManager.tsx` - Badge demo removido
    - `/src/app/dashboard/barber/page.tsx` - Dados reais implementados



### Features Secundárias

- [ ] **#015** - Sistema de busca básico 🔍 **BACKLOG**
  - **Descrição**: Busca de reviews por texto, barbeiro, serviço
  - **Componentes**: SearchBar, filtros avançados
  - **Estimativa**: 2 dias
  - **Assignee**: -

### Issues Concluídos - Média Prioridade

## 🔧 Baixa Prioridade

### Melhorias Técnicas

- [ ] **#008** - Performance optimization
  - **Descrição**: Bundle analysis e lazy loading
  - **Focus**: Core Web Vitals
  - **Estimativa**: 2 dias
  - **Assignee**: -

### Documentação

- [ ] **#009** - API documentation
  - **Descrição**: Swagger/OpenAPI docs
  - **Tool**: Next.js API routes docs
  - **Estimativa**: 1 dia
  - **Assignee**: -

## 🐛 Bugs Conhecidos

### Críticos

- Nenhum identificado

### Médios

- Nenhum identificado

### Baixos

- Nenhum identificado

## 💡 Ideias/Backlog

### Features Futuras

- [ ] **Chatbot de atendimento**
- [ ] **AR preview de cortes**
- [ ] **Sistema de recomendação**
- [ ] **Integração WhatsApp**
- [ ] **Sincronização Google Calendar**

### Melhorias UX

- [ ] **Animações de micro-interações**
- [ ] **Dark mode support**
- [ ] **PWA capabilities**
- [ ] **Offline functionality**

---

## 📊 Sprint Planning - Atualizado 22 Oct 2025

### Sprint Atual - Semana 4 (28 Oct - 3 Nov 2025) 📋 **EM PLANEJAMENTO**

**Objetivo**: Testes automatizados, analytics avançados e otimizações

**Tasks planejadas**:

- [ ] #014 - Implementação de testes automatizados básicos (3 story points)
- [ ] #015 - Sistema de busca básico (2 story points)
- [ ] Analytics avançados para barbeiros (2 story points)
- [ ] Performance optimizations (1 story point)

**Capacity**: 8 story points  
**Progress**: 0/8 points iniciados (0%)
**Risk**: Baixo (fundações sólidas estabelecidas)

### Sprint Concluído - Semana 3 (21-27 Oct 2025) 🏆 **CONCLUÍDO COM ÊXITO**

**Objetivo**: Finalizar integração de dados reais e polimento da aplicação

**Tasks concluídas**:

- ✅ #010 - Integração de dados reais nos dashboards (100% concluído)
- ✅ #011 - Sistema de notificações integrado (100% concluído)
- ✅ #012 - Loading states e skeleton loaders (100% concluído)
- ✅ #013 - Remover modo demonstração (100% concluído)
- ✅ **EXTRA** - Dashboard de administrador completo (100% concluído)

**Capacity**: 8 story points  
**Progress**: 8/8 points concluídos (100%) 🏆
**Result**: **SPRINT CONCLUÍDO COM SUCESSO** - Todas as metas atingidas + feature extra

### 🎯 **CONQUISTAS DO SPRINT SEMANA 3**:

#### **Dashboard de Administrador Completo** 🛡️
- Dashboard dedicado para role ADMIN com métricas globais
- Top barbeiros, distribuição de ratings, analytics avançados
- Gestão de usuários, relatórios e configurações do sistema
- Redirecionamento automático para admins

#### **Sistema de Notificações Profissional** 📱
- Hook useToast personalizado implementado
- Toast utilities com diferentes tipos (success, error, warning, info)
- Integração completa em ReviewForm e ReviewsList
- UI/UX polida com timeouts apropriados

#### **Integração de Dados Reais 100%** 📊
- Todos os dashboards conectados com métricas reais do banco
- Server actions otimizadas (getAdminMetrics, getBarberMetrics, getDashboardMetrics)
- Métricas automáticas funcionando corretamente
- Remoção completa do modo demonstração

### Sprint Concluído - Semana 1-2 (11-20 Oct 2025) ✅

**Objetivo**: Sistema de avaliações funcional e documentação atualizada

**Tasks concluídas**:

- ✅ #001 - Upload de imagens
- ✅ #002 - Formulário de avaliação
- ✅ #002.1 - Bug validação Zod
- ✅ #002.2 - Sistema de Reviews Completo
- ✅ #003 - Dashboard do Cliente
- ✅ #016 - Atualização completa da documentação

**Resultado**: 100% concluído - Sistema de reviews totalmente funcional com documentação padronizada

---

**Template para novos issues**:

```markdown
## Issue #XXX - [Título]

**Tipo**: Bug | Feature | Enhancement | Docs
**Prioridade**: Alta | Média | Baixa
**Estimativa**: X dias
**Labels**: frontend, backend, ui, docs

### Descrição

[Descrição detalhada]

### Critérios de Aceite

- [ ] Critério 1
- [ ] Critério 2

### Arquivos Afetados

- [ ] arquivo1.tsx
- [ ] arquivo2.ts

### Notas Técnicas

[Considerações técnicas importantes]
```
