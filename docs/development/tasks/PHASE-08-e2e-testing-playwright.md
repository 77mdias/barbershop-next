# 🧪 Tasks - Fase 08: Testes End-to-End com Playwright

**Status:** 🟢 ATIVA
**Última atualização:** 2026-03-26
**Sprint Atual:** Sprint QA E2E (Março-Abril/2026)
**Status Geral:** 🔴 0% (0/13 tarefas completas) - FASE INICIADA
**ETA:** 3 a 4 semanas
**Pré-requisito:** Fase 06 concluída (Home/Gallery 3D estáveis), seed database funcional

---

> **📌 NOTA:** Esta fase implementa cobertura de testes end-to-end com Playwright para todos os fluxos críticos de negócio, organizados por domínio e role. Estratégia de dados: seed base (`prisma/seed.ts`) + fixtures por contexto. Browsers alvo: Chromium desktop + Chromium mobile (390px).

---

## 📊 Resumo de Progresso

| Categoria | Total | Concluído | Em Andamento | Pendente | Bloqueado |
| --- | --- | --- | --- | --- | --- |
| E2E Foundation | 3 | 0 | 0 | 3 | 0 |
| Auth & Navigation | 3 | 0 | 0 | 3 | 0 |
| Core Business Flows | 3 | 0 | 0 | 3 | 0 |
| Social Features | 2 | 0 | 0 | 2 | 0 |
| Admin & RBAC | 2 | 0 | 0 | 2 | 0 |
| **TOTAL** | **13** | **0** | **0** | **13** | **0** |

### 🎯 Principais Indicadores
- ⚠️ Playwright não está instalado — a primeira task deve configurar tudo do zero.
- ✅ Seed database funcional com 9 users, 3 services, appointments, friendships, conversations.
- ✅ CI existente no GitHub Actions com PostgreSQL — precisa de step adicional para E2E.
- ⚠️ Auth usa JWT + NextAuth v4 — storageState precisa ser gerado por role (CLIENT, BARBER, ADMIN).

---

## 🎯 Objetivos da Fase

- Instalar e configurar Playwright com suporte a desktop e mobile viewport.
- Criar fixtures reutilizáveis de autenticação por role (CLIENT, BARBER, ADMIN) via storageState.
- Implementar helpers de dados para criar/limpar fixtures sob demanda (appointments, reviews, friendships).
- Cobrir todos os fluxos críticos de autenticação: signup, signin, OAuth, password reset, email verification.
- Cobrir fluxos de agendamento: criação, cancelamento, conflito de horários.
- Cobrir fluxos sociais: friend requests, chat, invite codes.
- Cobrir fluxos de reviews: criação, edição, listagem pública.
- Cobrir painel admin: CRUD de services/promotions, user management, dashboard metrics.
- Validar middleware de proteção de rotas por role.
- Integrar E2E no pipeline de CI (GitHub Actions).

---

## 📦 Estrutura de Categorias

### 📦 E2E Foundation - Setup, fixtures e infraestrutura

#### Objetivo
Configurar Playwright do zero com fixtures reutilizáveis de autenticação, helpers de dados e integração no CI. Toda a infraestrutura necessária para que as suites de domínio sejam produtivas.

#### FND.1 - Playwright Setup + Config

- [ ] **PH8-FND-001** - Instalar Playwright e criar configuração base

  **Descrição curta:**
  - Instalar Playwright como devDependency com browsers Chromium.
  - Criar `playwright.config.ts` com projects desktop (1280x720) e mobile (390x844).
  - Configurar webServer para subir o dev server automaticamente.
  - Adicionar scripts `test:e2e` e `test:e2e:ui` ao `package.json`.

  **Implementação sugerida:**
  - `npm init playwright@latest` com customizações.
  - Configurar `baseURL`, `testDir: 'e2e'`, timeouts (30s action, 60s test).
  - Adicionar `.playwright/` e `test-results/` ao `.gitignore`.
  - Criar estrutura base de diretórios: `e2e/fixtures/`, `e2e/helpers/`, `e2e/auth/`, etc.

  **Arquivos/áreas afetadas:** `package.json`, `playwright.config.ts`, `.gitignore`, `e2e/` (novo diretório)

  **Critérios de aceitação:**
  - [ ] `npx playwright test --project=chromium` executa sem erro (mesmo sem testes).
  - [ ] Projetos desktop e mobile configurados com viewports corretos.
  - [ ] Dev server sobe automaticamente ao rodar testes.

  **Prioridade:** 🔴 Crítica
  **Estimativa:** 3h
  **Dependências:** nenhuma
  **Status:** 🔴 Pendente

#### FND.2 - Auth Fixtures + StorageState

- [ ] **PH8-FND-002** - Criar fixtures de autenticação por role com storageState pré-gerado

  **Descrição curta:**
  - Criar global-setup que faz login como CLIENT, BARBER e ADMIN e salva storageState.
  - Criar fixture `auth.fixture.ts` que estende `test` do Playwright com contextos pré-autenticados.
  - Garantir que cada role tem seu próprio arquivo de state (`e2e/.auth/client.json`, `barber.json`, `admin.json`).

  **Implementação sugerida:**
  - No `global-setup.ts`: fazer login via `/api/auth/callback/credentials` para cada role do seed.
  - Salvar cookies/tokens em `.auth/` (adicionado ao `.gitignore`).
  - Criar `base.fixture.ts` que exporta `test` com `clientPage`, `barberPage`, `adminPage`.
  - Documentar credenciais de seed usadas (carlos@email.com [CLIENT], joao@barbershop.com [BARBER], admin@barbershop.com [ADMIN]).

  **Arquivos/áreas afetadas:** `e2e/global-setup.ts`, `e2e/fixtures/auth.fixture.ts`, `e2e/fixtures/base.fixture.ts`, `playwright.config.ts`

  **Critérios de aceitação:**
  - [ ] Três arquivos de storageState gerados no global-setup.
  - [ ] Fixture `clientPage` acessa `/profile` sem redirect para login.
  - [ ] Fixture `adminPage` acessa `/dashboard/admin` sem redirect.
  - [ ] Fixture `barberPage` acessa `/dashboard/barber` sem redirect.

  **Prioridade:** 🔴 Crítica
  **Estimativa:** 5h
  **Dependências:** PH8-FND-001
  **Status:** 🔴 Pendente

#### FND.3 - DB Helpers + CI Integration

- [ ] **PH8-FND-003** - Criar helpers de dados e integrar E2E no GitHub Actions

  **Descrição curta:**
  - Criar `e2e/helpers/db.ts` com funções para criar/limpar dados de teste via API ou Prisma diretamente.
  - Criar `e2e/helpers/api.ts` com helpers para chamadas HTTP autenticadas.
  - Adicionar step de E2E no `ci.yml` após o build.

  **Implementação sugerida:**
  - Helpers de DB: `createAppointment()`, `createFriendship()`, `createReview()`, `createNotification()`, `cleanup()`.
  - API helpers: `apiPost()`, `apiGet()` com headers de auth do storageState.
  - CI: instalar browsers, rodar `npx playwright test`, upload artifacts (traces, screenshots).
  - Configurar `global-teardown.ts` para cleanup de dados criados durante testes.

  **Arquivos/áreas afetadas:** `e2e/helpers/db.ts`, `e2e/helpers/api.ts`, `e2e/global-teardown.ts`, `.github/workflows/ci.yml`

  **Critérios de aceitação:**
  - [ ] Helper `createAppointment()` cria appointment e retorna ID.
  - [ ] Helper `cleanup()` remove dados criados no teste sem afetar seed.
  - [ ] CI executa testes E2E e faz upload de traces em caso de falha.

  **Prioridade:** 🔴 Crítica
  **Estimativa:** 4h
  **Dependências:** PH8-FND-002
  **Status:** 🔴 Pendente

---

### 📦 Auth & Navigation - Autenticação e proteção de rotas

#### Objetivo
Cobrir todos os fluxos de autenticação (signup, signin, OAuth, password reset) e validar que o middleware de proteção funciona corretamente para rotas públicas, protegidas e admin-only.

#### ANV.1 - Signup + Email Verification + Signin

- [ ] **PH8-ANV-001** - Testar fluxo completo de registro, verificação de email e login

  **Descrição curta:**
  - Signup com credenciais → redirect /auth/thank-you.
  - Signin com credenciais válidas → redirect /dashboard.
  - Signin com credenciais inválidas → mensagem de erro.
  - Signin com email não verificado → alerta com link para verificação.

  **Implementação sugerida:**
  - Criar `e2e/auth/signup-signin.spec.ts`.
  - Usar formulários reais (preencher inputs, clicar submit).
  - Validar redirects, mensagens de erro, e presença de elementos-chave.
  - Testar validação de senha (8+ chars, maiúscula, minúscula, número, especial).

  **Arquivos/áreas afetadas:** `e2e/auth/signup-signin.spec.ts`

  **Critérios de aceitação:**
  - [ ] Signup cria usuário e redireciona para thank-you.
  - [ ] Signin com credenciais válidas redireciona para dashboard.
  - [ ] Signin com senha errada mostra mensagem de erro.
  - [ ] Signup com email duplicado mostra erro específico.

  **Prioridade:** 🔴 Crítica
  **Estimativa:** 4h
  **Dependências:** PH8-FND-002
  **Status:** 🔴 Pendente

#### ANV.2 - Password Reset + Auth Redirects

- [ ] **PH8-ANV-002** - Testar fluxo de reset de senha e redirects de middleware

  **Descrição curta:**
  - Forgot password → mensagem de confirmação.
  - Usuário autenticado tenta /auth/signin → redirect /dashboard.
  - Usuário não autenticado tenta /scheduling → redirect /auth-required.
  - Client tenta /dashboard/admin → redirect /access-denied.

  **Implementação sugerida:**
  - Criar `e2e/auth/password-reset.spec.ts` e `e2e/navigation/middleware-guards.spec.ts`.
  - Testar fluxo de forgot-password (sem verificar email real — validar resposta da API).
  - Validar 4 cenários de middleware: public ok, auth redirect, protected redirect, admin block.

  **Arquivos/áreas afetadas:** `e2e/auth/password-reset.spec.ts`, `e2e/navigation/middleware-guards.spec.ts`

  **Critérios de aceitação:**
  - [ ] Forgot password mostra confirmação sem revelar se email existe.
  - [ ] Usuário logado em /auth/signin é redirecionado para /dashboard.
  - [ ] /scheduling sem auth redireciona para /auth-required.
  - [ ] Client em /dashboard/admin redireciona para /access-denied.

  **Prioridade:** 🔴 Crítica
  **Estimativa:** 3h
  **Dependências:** PH8-FND-002
  **Status:** 🔴 Pendente

#### ANV.3 - Public Pages + Mobile Navigation

- [ ] **PH8-ANV-003** - Testar renderização de páginas públicas e navegação mobile

  **Descrição curta:**
  - Home renderiza hero, serviços, promoções, reviews, CTA e footer.
  - Gallery renderiza pilares, coleções, portfólio com lightbox funcional.
  - Menu mobile abre/fecha, links funcionam, ESC fecha, backdrop fecha.
  - Páginas informativas renderizam sem erro (prices, about, support, legal/*).

  **Implementação sugerida:**
  - Criar `e2e/public/home.spec.ts`, `e2e/public/gallery.spec.ts`, `e2e/navigation/mobile-nav.spec.ts`.
  - Usar projeto mobile para testes de menu.
  - Validar presença de headings, CTAs, links, e interações de lightbox.
  - Smoke test de cada página informativa (status 200, heading principal presente).

  **Arquivos/áreas afetadas:** `e2e/public/home.spec.ts`, `e2e/public/gallery.spec.ts`, `e2e/navigation/mobile-nav.spec.ts`, `e2e/public/informational.spec.ts`

  **Critérios de aceitação:**
  - [ ] Home renderiza todas as 5 seções do storyboard sem erro.
  - [ ] Gallery lightbox abre, navega entre imagens e fecha por ESC.
  - [ ] Menu mobile abre, exibe todos os links, fecha por ESC e backdrop.
  - [ ] Todas as páginas informativas retornam 200 e exibem heading.

  **Prioridade:** 🟡 Alta
  **Estimativa:** 3h
  **Dependências:** PH8-FND-001
  **Status:** 🔴 Pendente

---

### 📦 Core Business Flows - Agendamento, reviews e notificações

#### Objetivo
Cobrir os fluxos de maior valor de negócio: ciclo completo de agendamento, sistema de avaliações e notificações em tempo real.

#### CBF.1 - Appointment Booking Flow

- [ ] **PH8-CBF-001** - Testar ciclo completo de agendamento: criar, visualizar, cancelar

  **Descrição curta:**
  - Client cria appointment: seleciona serviço, barbeiro, data/hora → confirmação.
  - Client visualiza appointment em /scheduling/manage.
  - Client cancela appointment → status atualizado.
  - Client tenta horário indisponível → mensagem de conflito.

  **Implementação sugerida:**
  - Criar `e2e/scheduling/appointment-flow.spec.ts`.
  - Usar `clientPage` fixture para autenticação.
  - Fixture: criar appointment no mesmo slot para teste de conflito.
  - Validar navegação entre steps do formulário de agendamento.

  **Arquivos/áreas afetadas:** `e2e/scheduling/appointment-flow.spec.ts`

  **Critérios de aceitação:**
  - [ ] Appointment criado aparece na lista de agendamentos do cliente.
  - [ ] Cancelamento muda status visível de SCHEDULED para CANCELLED.
  - [ ] Horário ocupado mostra feedback de indisponibilidade.
  - [ ] Formulário valida campos obrigatórios antes de submeter.

  **Prioridade:** 🔴 Crítica
  **Estimativa:** 6h
  **Dependências:** PH8-FND-003
  **Status:** 🔴 Pendente

#### CBF.2 - Review System

- [ ] **PH8-CBF-002** - Testar criação, edição e listagem pública de reviews

  **Descrição curta:**
  - Client cria review com rating (1-5 estrelas) e comentário após serviço completo.
  - Client edita review existente → dados atualizados na listagem.
  - Reviews públicos visíveis em /reviews sem autenticação.

  **Implementação sugerida:**
  - Criar `e2e/reviews/review-flow.spec.ts`.
  - Fixture: criar serviceHistory sem review (para criação) e com review (para edição).
  - Validar interação de rating (clique em estrelas), textarea de comentário.
  - Verificar que review aparece na listagem pública após criação.

  **Arquivos/áreas afetadas:** `e2e/reviews/review-flow.spec.ts`

  **Critérios de aceitação:**
  - [ ] Review criado com 5 estrelas e comentário aparece na listagem.
  - [ ] Edição de review reflete novo rating e comentário.
  - [ ] /reviews exibe reviews sem exigir autenticação.

  **Prioridade:** 🟡 Alta
  **Estimativa:** 4h
  **Dependências:** PH8-FND-003
  **Status:** 🔴 Pendente

#### CBF.3 - Notification System

- [ ] **PH8-CBF-003** - Testar notificações: aparição no bell, mark as read, mark all

  **Descrição curta:**
  - Notificação aparece no bell após friend request recebido.
  - Clicar em notificação marca como lida (badge atualiza).
  - "Marcar todas como lidas" limpa contador de não lidas.

  **Implementação sugerida:**
  - Criar `e2e/notifications/notification-flow.spec.ts`.
  - Fixture: criar notificações pendentes via helper de DB.
  - Validar badge de contagem no NotificationBell.
  - Testar interação de mark as read individual e em lote.

  **Arquivos/áreas afetadas:** `e2e/notifications/notification-flow.spec.ts`

  **Critérios de aceitação:**
  - [ ] Badge exibe contagem correta de notificações não lidas.
  - [ ] Marcar individual como lida decrementa badge.
  - [ ] "Marcar todas como lidas" zera badge.

  **Prioridade:** 🟡 Alta
  **Estimativa:** 4h
  **Dependências:** PH8-FND-003
  **Status:** 🔴 Pendente

---

### 📦 Social Features - Friendships, chat e invite codes

#### Objetivo
Cobrir os fluxos sociais que conectam usuários: ciclo de friend request, messaging em tempo real e sistema de convites.

#### SOC.1 - Friend Request + Invite Flow

- [ ] **PH8-SOC-001** - Testar ciclo de friend request, rejeição e invite code

  **Descrição curta:**
  - Client envia friend request → receiver vê notificação → aceita → ambos viram amigos.
  - Client rejeita friend request → request some da lista.
  - Client gera invite code → outro user usa → ficam amigos.
  - Busca de usuários por nome retorna resultados corretos.

  **Implementação sugerida:**
  - Criar `e2e/social/friendship-flow.spec.ts`.
  - Usar dois contextos autenticados (client1 e client2) para simular interação.
  - Validar estado da listagem de amigos após aceite/rejeição.
  - Testar busca por nome parcial em /profile/social.

  **Arquivos/áreas afetadas:** `e2e/social/friendship-flow.spec.ts`

  **Critérios de aceitação:**
  - [ ] Friend request aceito adiciona ambos à lista de amigos.
  - [ ] Friend request rejeitado não aparece mais na lista de pendentes.
  - [ ] Invite code válido cria amizade bidirecional.
  - [ ] Busca por nome retorna usuários matching.

  **Prioridade:** 🟡 Alta
  **Estimativa:** 5h
  **Dependências:** PH8-FND-003
  **Status:** 🔴 Pendente

#### SOC.2 - Chat & Messaging

- [ ] **PH8-SOC-002** - Testar criação de conversa, envio de mensagens e leitura

  **Descrição curta:**
  - Amigos iniciam conversa → enviam mensagens → mensagens aparecem em tempo real.
  - Marcar conversa como lida atualiza status.
  - Lista de conversas mostra última mensagem e timestamp.

  **Implementação sugerida:**
  - Criar `e2e/social/chat-flow.spec.ts`.
  - Fixture: friendship existente entre dois users.
  - Usar dois contextos (client1 e client2) para simular chat bidirecional.
  - Validar envio, recebimento e ordenação de mensagens.

  **Arquivos/áreas afetadas:** `e2e/social/chat-flow.spec.ts`

  **Critérios de aceitação:**
  - [ ] Mensagem enviada aparece na conversa do destinatário.
  - [ ] Lista de conversas exibe preview da última mensagem.
  - [ ] Conversa marcada como lida limpa indicador de não lidas.

  **Prioridade:** 🟡 Alta
  **Estimativa:** 5h
  **Dependências:** PH8-SOC-001
  **Status:** 🔴 Pendente

---

### 📦 Admin & RBAC - Dashboard admin e permissões por role

#### Objetivo
Validar que o painel admin funciona corretamente para CRUD de resources e que as permissões por role bloqueiam acesso indevido.

#### ARB.1 - Admin CRUD (Services + Promotions + Users)

- [ ] **PH8-ARB-001** - Testar CRUD completo de services, promotions e user management

  **Descrição curta:**
  - Admin cria serviço → aparece na listagem → edita → verifica mudanças.
  - Admin cria promoção → aparece na listagem → toggle status (ativa/inativa).
  - Admin lista users com filtros → soft-delete user → restore.
  - Admin dashboard exibe métricas (users, revenue, appointments).

  **Implementação sugerida:**
  - Criar `e2e/admin/admin-crud.spec.ts`.
  - Usar `adminPage` fixture para autenticação.
  - Navegar pelos formulários de criação/edição reais.
  - Validar que listagens refletem mudanças após CRUD.

  **Arquivos/áreas afetadas:** `e2e/admin/admin-crud.spec.ts`

  **Critérios de aceitação:**
  - [ ] Serviço criado aparece na listagem com nome e preço corretos.
  - [ ] Edição de serviço reflete mudanças na listagem.
  - [ ] Promoção toggle muda status visível (ativa ↔ inativa).
  - [ ] Soft-delete marca user como removido; restore reverte.
  - [ ] Dashboard admin exibe métricas sem erro.

  **Prioridade:** 🟡 Alta
  **Estimativa:** 6h
  **Dependências:** PH8-FND-002
  **Status:** 🔴 Pendente

#### ARB.2 - Barber Dashboard + Role Guards

- [ ] **PH8-ARB-002** - Testar dashboard do barber e guards de role no middleware

  **Descrição curta:**
  - Barber acessa /dashboard/barber com seus appointments visíveis.
  - Client tenta /dashboard/admin → redirect /access-denied.
  - Barber tenta /dashboard/admin → redirect /access-denied.
  - Usuário não autenticado tenta /dashboard → redirect /auth-required.

  **Implementação sugerida:**
  - Criar `e2e/admin/role-guards.spec.ts`.
  - Usar fixtures de 3 roles para validar acesso/bloqueio.
  - Verificar presença de dados no dashboard do barber (appointments do dia, métricas).
  - Validar que redirects levam para páginas corretas com mensagem adequada.

  **Arquivos/áreas afetadas:** `e2e/admin/role-guards.spec.ts`

  **Critérios de aceitação:**
  - [ ] Barber vê seus appointments no dashboard.
  - [ ] Client em /dashboard/admin é redirecionado para /access-denied.
  - [ ] Barber em /dashboard/admin é redirecionado para /access-denied.
  - [ ] Unauthenticated em /dashboard é redirecionado para /auth-required.

  **Prioridade:** 🟡 Alta
  **Estimativa:** 4h
  **Dependências:** PH8-FND-002
  **Status:** 🔴 Pendente

---

## 🧪 Testes e Validações

- **Framework:** Playwright Test Runner com projetos desktop (1280x720) e mobile (390x844).
- **Browsers:** Chromium (desktop + mobile viewport).
- **Cobertura alvo:** 30 cenários E2E cobrindo 7 domínios e 3 roles.
- **Comandos de verificação:**
  ```bash
  npx playwright test                          # Rodar todos os E2E
  npx playwright test --project=desktop        # Apenas desktop
  npx playwright test --project=mobile         # Apenas mobile
  npx playwright test --ui                     # Modo UI interativo
  npx playwright show-report                   # Relatório HTML
  npx playwright test e2e/auth/               # Suite específica
  ```
- **Estratégia de dados:** Seed base (`prisma/seed.ts`) + fixtures sob demanda por suite.
- **CI:** Step dedicado em `.github/workflows/ci.yml` com upload de traces em falhas.

---

## 📚 Documentação e Comunicação

- Atualizar `docs/development/tasks/TASKS.md` com referência desta fase ao iniciar execução.
- Atualizar `docs/development/CHANGELOG.md` sob `[Unreleased]` ao concluir blocos da fase.
- Documentar credenciais de seed usadas nos testes em `e2e/README.md`.
- Registrar decisões de fixture/helper neste arquivo para evitar divergência entre PRs.

---

## ✅ Checklist de Encerramento da Fase

- [ ] Todas as tarefas da fase concluídas com status atualizado.
- [ ] Playwright instalado e configurado com projetos desktop e mobile.
- [ ] Fixtures de autenticação funcionando para 3 roles.
- [ ] 30 cenários E2E passando em desktop e mobile.
- [ ] CI executando E2E com upload de traces em caso de falha.
- [ ] Helpers de dados documentados e reutilizáveis.
- [ ] Documentação de task/changelog atualizada.
- [ ] Aprovação final registrada em PR/issue.

Ao finalizar, mover para estado "ARQUIVADA" e registrar nota histórica no topo com data e resumo de entregas.
