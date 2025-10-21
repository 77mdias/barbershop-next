# 🎯 Tasks & Issues - Barbershop Next

Lista organizada de tarefas, bugs e melhorias pendentes.

**Última atualização**: 21 de outubro de 2025  
**Sprint Atual**: Sprint 3 (21-27 Out 2025)  
**Capacidade**: 8 story points  
**Progresso**: 2/8 story points (25%)

---

## 📊 Visão Geral do Sprint Atual

### Status Geral

| Categoria | Abertas | Em Progresso | Concluídas | Total |
|-----------|---------|--------------|------------|-------|
| 🔥 Alta Prioridade | 3 | 1 | 0 | 4 |
| 📋 Média Prioridade | 2 | 0 | 0 | 2 |
| 🔧 Baixa Prioridade | 3 | 0 | 0 | 3 |
| **TOTAL** | **8** | **1** | **0** | **9** |

### Health Check

- ✅ **0 bloqueadores críticos**
- ⚠️ **1 issue em progresso** (Integração de dados)
- 🚨 **3 issues de alta prioridade aguardando**
- 📈 **Velocidade**: Dentro do esperado (25% do sprint)

---

## 🔥 Alta Prioridade - Sprint 3 (21-27 Out 2025)

### 🚧 Em Progresso

#### #010 - Integração de Dados Reais nos Dashboards

**Status**: 🚧 **EM PROGRESSO** (70%)  
**Prioridade**: 🔥 Crítica  
**Estimativa**: 3 dias  
**Tempo Gasto**: 2 dias  
**Assignee**: GitHub Copilot  
**Sprint**: 3

**Descrição**:
Conectar métricas dos dashboards com dados reais do banco de dados, substituindo dados mockados por queries reais do Prisma.

**Progresso Detalhado**:
- ✅ Server actions funcionais (100%)
- 🚧 Dashboard barbeiro (50% - métricas mockadas)
- 🚧 Dashboard cliente (50% - estatísticas mockadas)
- 📝 ReviewSection component (0% - precisa dados dinâmicos)
- 📝 Métricas automáticas (30% - estrutura existe)

**Componentes a Modificar**:
- [x] `/src/server/reviewActions.ts` - Adicionar `getMetrics()`
- [ ] `/src/app/dashboard/barber/page.tsx` - Conectar métricas reais
- [ ] `/src/app/dashboard/page.tsx` - Estatísticas reais
- [ ] `/src/components/ReviewSection.tsx` - Dados dinâmicos

**Critérios de Aceite**:
- [ ] Todas as métricas vêm do banco de dados
- [ ] Não há dados mockados nos dashboards
- [ ] Performance adequada (queries < 200ms)
- [ ] Caching implementado onde apropriado
- [ ] Testes manuais passando

**Bloqueios**: Nenhum  
**Notas**: Issue #013 (remover modo demo) depende desta task

---

### 📝 Aguardando (Alta Prioridade)

#### #011 - Sistema de Notificações Integrado

**Status**: 📝 **AGUARDANDO**  
**Prioridade**: 🔥 Alta  
**Estimativa**: 2 dias  
**Assignee**: GitHub Copilot  
**Sprint**: 3

**Descrição**:
Implementar sistema completo de toast notifications para feedback de ações do usuário (sucesso, erro, info, warning).

**Progresso**: 20%
- UI básico existe (sonner já instalado)
- Integração pendente

**Componentes a Criar/Modificar**:
- [ ] `/src/components/ui/toast.tsx` - Sistema completo de toast
- [ ] `/src/providers/ToastProvider.tsx` - Provider global
- [ ] `/src/app/layout.tsx` - Adicionar ToastProvider
- [ ] `/src/components/ReviewForm.tsx` - Integrar toasts
- [ ] `/src/components/ReviewsList.tsx` - Integrar toasts
- [ ] `/src/app/dashboard/page.tsx` - Integrar toasts

**Critérios de Aceite**:
- [ ] Toasts aparecem para todas as ações CRUD
- [ ] Mensagens claras e úteis
- [ ] Animações suaves
- [ ] Opção de fechar manualmente
- [ ] Auto-dismiss configurável
- [ ] Suporte a diferentes tipos (success, error, info, warning)

**Dependências**: Nenhuma  
**Referência**: Usar biblioteca `sonner` já instalada

---

#### #012 - Loading States e Skeleton Loaders

**Status**: 📝 **AGUARDANDO**  
**Prioridade**: 🔥 Alta  
**Estimativa**: 2 dias  
**Assignee**: GitHub Copilot  
**Sprint**: 3

**Descrição**:
Implementar estados de loading e skeleton loaders em todos os componentes para melhorar UX durante carregamentos.

**Progresso**: 0%

**Componentes a Criar**:
- [ ] `/src/components/ui/skeleton.tsx` - Skeleton loader base
- [ ] `/src/components/ui/loading-spinner.tsx` - Spinner
- [ ] `/src/components/ui/loading-overlay.tsx` - Overlay de loading

**Componentes a Modificar** (adicionar loading states):
- [ ] `/src/app/dashboard/page.tsx`
- [ ] `/src/app/dashboard/barber/page.tsx`
- [ ] `/src/components/ReviewsList.tsx`
- [ ] `/src/components/ReviewForm.tsx`
- [ ] `/src/components/ReviewSection.tsx`

**Critérios de Aceite**:
- [ ] Skeleton loaders em listas
- [ ] Loading spinners em ações assíncronas
- [ ] Estados de loading em dashboards
- [ ] Transições suaves
- [ ] Acessibilidade (ARIA labels)
- [ ] Não bloquear UI desnecessariamente

**Dependências**: Nenhuma  
**Referência**: Usar shadcn/ui skeleton pattern

---

#### #016 - Performance: Otimização de Queries

**Status**: 📝 **AGUARDANDO**  
**Prioridade**: 🔥 Alta  
**Estimativa**: 1 dia  
**Assignee**: -  
**Sprint**: 3

**Descrição**:
Otimizar queries do Prisma para reduzir tempo de carregamento dos dashboards e listas.

**Tasks**:
- [ ] Identificar queries lentas (> 200ms)
- [ ] Adicionar índices apropriados no schema Prisma
- [ ] Implementar paginação eficiente
- [ ] Adicionar select específico (evitar carregar todos campos)
- [ ] Implementar caching com React Cache
- [ ] Profiling com Prisma Debug

**Arquivos a Modificar**:
- [ ] `/prisma/schema.prisma` - Adicionar índices
- [ ] `/src/server/reviewActions.ts` - Otimizar queries
- [ ] `/src/app/dashboard/*/page.tsx` - Implementar caching

**Critérios de Aceite**:
- [ ] Todas as queries < 200ms
- [ ] Índices apropriados no banco
- [ ] Caching funcionando
- [ ] Paginação eficiente
- [ ] Documentação de otimizações

**Impacto**: 🚀 Alto - Melhora experiência do usuário

---

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

- [ ] **#013** - Remover modo demonstração 🎪 **NOVA**

  - **Descrição**: Remover badges e textos de "MODO DEMONSTRAÇÃO" dos componentes
  - **Componentes**: ReviewSystemManager, dashboards
  - **Estimativa**: 1 dia
  - **Assignee**: GitHub Copilot
  - **Status**: Vários componentes ainda em modo demo
  - **Arquivos a modificar**:
    - `/src/components/ReviewSystemManager.tsx` - Remover badge demo
    - `/src/app/dashboard/barber/page.tsx` - Dados reais ao invés de "--"

- [ ] **#014** - Testes unitários básicos 🧪 **NOVA**
  - **Descrição**: Setup básico de testing com Jest + Testing Library
  - **Componentes**: ReviewForm, ReviewsList, principais UI components
  - **Estimativa**: 3 dias
  - **Assignee**: GitHub Copilot
  - **Status**: Apenas testes manuais existem
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

*Nenhum issue de média prioridade foi concluído ainda neste sprint.*

---

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

*Nenhum bug crítico identificado no momento.* ✅

### Médios

*Nenhum bug médio identificado no momento.* ✅

### Baixos

*Nenhum bug baixo identificado no momento.* ✅

### 🎯 Ações Preventivas

Para manter a qualidade do código e prevenir bugs:
- [ ] Implementar testes automatizados (Issue #014)
- [ ] Code review obrigatório para PRs
- [ ] Linting e type-checking no CI
- [ ] Monitoring em produção

---

## 💡 Ideias/Backlog

### Features Futuras (Sprint 5+)

| Feature | Complexidade | Impacto | Prioridade | Sprint Estimado |
|---------|--------------|---------|------------|-----------------|
| Chatbot de atendimento | Alta | Alto | Média | Sprint 7-8 |
| AR preview de cortes | Muito Alta | Médio | Baixa | Sprint 10+ |
| Sistema de recomendação | Alta | Alto | Média | Sprint 8-9 |
| Integração WhatsApp | Média | Alto | Alta | Sprint 6 |
| Sincronização Google Calendar | Média | Alto | Alta | Sprint 6 |
| Pagamentos (Stripe) | Alta | Crítico | Alta | Sprint 5 |
| Dashboard Admin completo | Alta | Alto | Média | Sprint 7 |
| PWA capabilities | Média | Médio | Média | Sprint 8 |

### Melhorias UX (Futuro)

- [ ] **Animações de micro-interações**
  - Transições suaves entre páginas
  - Feedback visual de ações
  - Hover effects refinados

- [ ] **Dark mode support**
  - Tema escuro completo
  - Toggle de tema
  - Persistência de preferência

- [ ] **PWA capabilities**
  - Installable app
  - Offline functionality
  - Push notifications

- [ ] **Offline functionality**
  - Service workers
  - Cache estratégico
  - Sync quando online

### Integrações Planejadas

- [ ] **WhatsApp Business API** - Notificações e confirmações
- [ ] **Google Calendar** - Sincronização de agenda
- [ ] **Stripe** - Pagamentos online
- [ ] **Mercado Pago** - Alternativa BR de pagamento
- [ ] **SendGrid** - Email marketing
- [ ] **Twilio** - SMS notifications
- [ ] **Google Maps** - Localização

---

---

## 📊 Sprint Planning - Atualizado 21 Out 2025

### Sprint Atual - Sprint 3 (21-27 Out 2025) 🚧

**Objetivo**: Finalizar integração de dados reais e melhorar UX

**Tasks Selecionadas**:

| ID | Task | Story Points | Status |
|----|------|--------------|--------|
| #010 | Integração de dados reais | 3 | 🚧 Em progresso (70%) |
| #011 | Sistema de notificações | 2 | 📝 Aguardando |
| #012 | Loading states | 2 | 📝 Aguardando |
| #013 | Remover modo demo | 1 | ⏸️ Bloqueado |

**Capacidade**: 8 story points  
**Progresso**: 2/8 pontos (25%)  
**Dias Restantes**: 6 dias

**Riscos Identificados**:
- ⚠️ Médio - Integração de dados pode ter complexidades imprevistas
- ⚠️ Baixo - Dependência entre tasks (#013 depende de #010)

**Ações**:
- Finalizar #010 para desbloquear #013
- Iniciar #011 em paralelo com #010
- Manter foco em qualidade sobre velocidade

---

### Próximo Sprint - Sprint 4 (28 Out - 3 Nov 2025) 📋

**Objetivo**: Testes automatizados e features secundárias

**Tasks Planejadas**:

| ID | Task | Story Points | Prioridade |
|----|------|--------------|------------|
| #014 | Testes unitários básicos | 3 | 📋 Média |
| #015 | Sistema de busca | 2 | 📋 Média |
| #016 | Performance optimization | 1 | 🔥 Alta |
| TBD | Analytics avançados | 2 | 📋 Média |

**Capacidade Estimada**: 8 story points  
**Dependências**: Sprint 3 deve estar 100% concluído

---

### Sprint Concluído - Sprint 1-2 (11-20 Out 2025) ✅

**Objetivo**: Sistema de avaliações completo e funcional

**Tasks Concluídas**:

| ID | Task | Planejado | Real | Variação |
|----|------|-----------|------|----------|
| #001 | Upload de imagens | 2 dias | 2 dias | 0% |
| #002 | Formulário de avaliação | 3 dias | 3 dias | 0% |
| #002.1 | Bug validação Zod | - | 0.5 dias | Hotfix |
| #002.2 | Sistema completo | 2 dias | 2 dias | 0% |
| #003 | Dashboard do Cliente | 2 dias | 2 dias | 0% |

**Resultado**: ✅ 100% concluído (8/8 story points)  
**Velocity**: 4 story points/semana  
**Quality**: Alta - Poucas regressões

**Lições Aprendidas**:
- ✅ Planning detalhado reduz retrabalho
- ✅ Testes manuais detectaram bug crítico (#002.1)
- ⚠️ Faltam testes automatizados (priorizar no Sprint 4)

---

## 📈 Métricas de Desenvolvimento

### Velocity (últimos 3 sprints)

| Sprint | Planejado | Completo | Velocity | Taxa |
|--------|-----------|----------|----------|------|
| Sprint 1-2 | 8 SP | 8 SP | 4 SP/semana | 100% |
| Sprint 3 | 8 SP | 2 SP (parcial) | - | 25% |
| **Média** | - | - | **4 SP/semana** | **62.5%** |

### Distribuição de Issues

| Tipo | Total | Concluídas | Em Progresso | Backlog |
|------|-------|------------|--------------|---------|
| Features | 12 | 5 | 1 | 6 |
| Bugs | 1 | 1 | 0 | 0 |
| Melhorias | 6 | 0 | 0 | 6 |
| Docs | 3 | 0 | 0 | 3 |

### Health Metrics

- ✅ **Bug Rate**: 0% (0 bugs ativos)
- ✅ **Blocker Rate**: 11% (1/9 issues bloqueados)
- ⚠️ **Test Coverage**: 5% (crítico)
- ✅ **Documentation**: 85% (bom)

---

## 🎯 Template para Novos Issues

Use este template ao criar novos issues:

```markdown
## Issue #XXX - [Título Descritivo]

**Tipo**: 🐛 Bug | ✨ Feature | 🔄 Enhancement | 📚 Docs  
**Prioridade**: 🔥 Alta | 📋 Média | 🔧 Baixa  
**Estimativa**: X dias (X story points)  
**Sprint**: Sprint X  
**Labels**: `frontend` `backend` `ui` `docs`

### 📝 Descrição

[Descrição detalhada e clara do problema ou feature]

### 🎯 Critérios de Aceite

- [ ] Critério 1 - Específico e testável
- [ ] Critério 2 - Mensurável
- [ ] Critério 3 - Com condições de sucesso

### 📁 Arquivos Afetados

- [ ] `/src/path/file1.tsx` - [Modificação necessária]
- [ ] `/src/path/file2.ts` - [Modificação necessária]

### 🔗 Dependências

- Depende de: Issue #YYY
- Bloqueia: Issue #ZZZ

### 🛠️ Notas Técnicas

[Considerações técnicas importantes, decisões de arquitetura, etc.]

### 📊 Definição de Pronto (DoD)

- [ ] Código implementado e funcionando
- [ ] Testes passando (manual ou automatizado)
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Merged na branch principal
```

---

**Última atualização**: 21 de outubro de 2025  
**Mantido por**: Development Team  
**Próxima revisão**: 28 de outubro de 2025  
**Status**: 🚧 **Sprint 3 ativo - 25% concluído**
