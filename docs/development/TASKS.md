# 🎯 Tasks & Issues - Barbershop Next

Lista organizada de tarefas, bugs e melhorias pendentes.

## 🔥 Alta Prioridade - Semana 3 (21-27 Oct 2025)

### Issues Críticos da Semana Atual

- [ ] **#010** - Integração de dados reais nos dashboards 🚧 **EM PROGRESSO**

  - **Descrição**: Conectar métricas dos dashboards com dados reais do banco
  - **Componentes**: Dashboard barbeiro, estatísticas, métricas automáticas
  - **Estimativa**: 2 dias (75% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: Server actions funcionais, dashboards com dados parcialmente reais
  - **Arquivos a modificar**:
    - `/src/app/dashboard/barber/page.tsx` - Conectar métricas reais
    - `/src/app/dashboard/page.tsx` - Estatísticas reais
    - `/src/components/ReviewSection.tsx` - Dados dinâmicos
    - `/src/server/reviewActions.ts` - Adicionar getMetrics()

- [ ] **#011** - Sistema de notificações integrado 📱 **EM PROGRESSO**

  - **Descrição**: Implementar toast notifications para todas as ações
  - **Componentes**: Toast provider, notificações de sucesso/erro
  - **Estimativa**: 1 dia (50% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: UI básico implementado, integração em andamento
  - **Arquivos a criar/modificar**:
    - `/src/components/ui/toast.tsx` - Sistema completo de toast
    - `/src/providers/ToastProvider.tsx` - Provider global
    - Integrar em ReviewForm, ReviewsList, dashboards

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

- [ ] **#014** - Testes unitários básicos 🧪 **EM PROGRESSO**
  - **Descrição**: Setup básico de testing com Jest + Testing Library
  - **Componentes**: ReviewForm, ReviewsList, principais UI components
  - **Estimativa**: 2 dias (30% concluído)
  - **Assignee**: GitHub Copilot
  - **Status**: Estrutura básica de testes configurada
  - **Arquivos a criar**:
    - `jest.config.js` - Configuração Jest
    - `__tests__/` - Diretório de testes
    - Tests para componentes críticos

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

## 📊 Sprint Planning - Atualizado 21 Oct 2025

### Sprint Atual - Semana 3 (21-27 Oct 2025)

**Objetivo**: Finalizar integração de dados reais e polimento da aplicação

**Tasks selecionadas**:

- #010 - Integração de dados reais nos dashboards (75% concluído)
- #011 - Sistema de notificações integrado (50% concluído)
- ✅ #012 - Loading states e skeleton loaders (100% concluído)
- ✅ #013 - Remover modo demonstração (100% concluído)
- ✅ #016 - Atualização completa da documentação (100% concluído)

**Capacity**: 8 story points  
**Progress**: 6/8 points concluídos (75%)
**Risk**: Baixo (principais implementações finalizadas)

### Próximo Sprint - Semana 4 (28 Oct - 3 Nov 2025)

**Objetivo**: Testes e analytics avançados

**Tasks planejadas**:

- #014 - Testes unitários básicos
- #015 - Sistema de busca básico
- Analytics avançados para barbeiros
- Performance optimizations

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
