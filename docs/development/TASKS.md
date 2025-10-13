# 🎯 Tasks & Issues - Barbershop Next

Lista organizada de tarefas, bugs e melhorias pendentes.

## 🔥 Alta Prioridade

### Issues Críticos
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

## 📋 Média Prioridade

### UI/UX Improvements
- [ ] **#004** - Sistema de notificações
  - **Descrição**: Toast notifications para ações do usuário
  - **Componentes**: NotificationProvider, Toast
  - **Estimativa**: 1 dia
  - **Assignee**: -

- [ ] **#005** - Loading states
  - **Descrição**: Skeleton loaders para melhor UX
  - **Componentes**: Skeleton, LoadingSpinner
  - **Estimativa**: 2 dias
  - **Assignee**: -

### Features Secundárias
- [ ] **#006** - Sistema de busca
  - **Descrição**: Busca de barbeiros e serviços
  - **Componentes**: SearchBar, SearchResults
  - **Estimativa**: 3 dias
  - **Assignee**: -

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

## 📊 Sprint Planning

### Sprint Atual (11-17 Oct 2025)
**Objetivo**: Sistema de avaliações funcional

**Tasks selecionadas**:
- #001 - Upload de imagens
- #002 - Formulário de avaliação
- #004 - Sistema de notificações

**Capacity**: 6 story points  
**Risk**: Baixo

### Próximo Sprint (18-24 Oct 2025)
**Objetivo**: Dashboard do cliente

**Tasks planejadas**:
- #003 - Dashboard do Cliente
- #005 - Loading states
- #006 - Sistema de busca

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