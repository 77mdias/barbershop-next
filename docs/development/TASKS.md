# 🎯 Tasks & Issues - Barbershop Next

Lista organizada de tarefas, bugs e melhorias pendentes.

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

### 🚀 Sprint 2 - Planejado: Notificações em Tempo Real (4-8 Nov 2025)

- [ ] **#019** - Sprint 2: Sistema de Notificações em Tempo Real 🚧 **EM PLANEJAMENTO**
  - **Descrição**: Implementar WebSocket/Server-Sent Events para notificações push automáticas
  - **Componentes**: WebSocket provider, Real-time updates, Multi-tab sync
  - **Estimativa**: 1 sprint (5 tarefas)
  - **Assignee**: A definir
  - **Status**: Planejado
  - **Tarefas Sprint 2 Planejadas**:
    - [ ] Configurar WebSocket ou Server-Sent Events
    - [ ] Provider de real-time para React
    - [ ] Auto-push de notificações sem refresh
    - [ ] Sincronização multi-tab
    - [ ] Otimizações de performance
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

- [ ] **#007** - Testes automatizados

  - **Descrição**: Setup de testing suite
  - **Tools**: Jest, Testing Library, Playwright
  - **Estimativa**: 4 dias
  - **Assignee**: -

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
