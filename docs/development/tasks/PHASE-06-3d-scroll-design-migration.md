# 🚀 Tasks - Fase 06: Migração de Design para 3D com Scroll

**Status:** 🟢 ATIVA  
**Última atualização:** 2026-03-25  
**Sprint Atual:** Sprint Frontend UX 3D (Março/2026)  
**Status Geral:** 🟡 31% (5/16 tarefas completas) - FASE ATIVA  
**ETA:** 2 a 3 semanas  
**Pré-requisito:** baseline Home/Gallery 3D existente (parcialmente concluído)

---

> **📌 NOTA:** Esta fase define a migração guiada para um design 3D com narrativa por scroll sem adicionar novas bibliotecas além das já existentes (`three`, `@react-three/fiber`, `@react-three/drei`, `motion`).

---

## 📊 Resumo de Progresso

| Categoria | Total | Concluído | Em Andamento | Pendente | Bloqueado |
| --- | --- | --- | --- | --- | --- |
| Foundation Design System | 3 | 3 | 0 | 0 | 0 |
| Layout + Scroll 3D | 4 | 2 | 0 | 2 | 0 |
| Motion + Interações | 4 | 0 | 0 | 4 | 0 |
| Responsividade + A11y | 3 | 0 | 0 | 3 | 0 |
| Performance + QA | 2 | 0 | 0 | 2 | 0 |
| **TOTAL** | **16** | **5** | **0** | **11** | **0** |

### 🎯 Principais Indicadores
- ✅ Escopo fechado para `Home` e `Gallery` como referência da fase.
- ⚠️ Dependência crítica: corrigir `next/image` para host Cloudinary em ambiente real.
- ⚠️ Risco de performance móvel em camadas 3D sem orçamento de FPS formal.

---

## 🎯 Objetivos da Fase

- Definir e aplicar um sistema visual consistente para telas com fundo 3D e conteúdo em camadas.
- Migrar a Home para narrativa de scroll orientada por depth/parallax de imagens e blocos.
- Padronizar tipografia, espaçamento e hierarquia visual com tokens reutilizáveis.
- Formalizar um motion system com tempos, easings e gatilhos de scroll/hover/focus.
- Garantir responsividade mobile-first sem perda de legibilidade ou quebra de fluxo.
- Definir critérios de acessibilidade (contraste, foco, reduced-motion) e fallback visual.
- Estabelecer orçamento de performance (FPS alvo e limites de render) para cenas 3D.

---

## 📦 Estrutura de Categorias

### 📦 Foundation Design System - Tokens e linguagem visual base

#### Objetivo
Consolidar uma camada de fundação para evitar estilos ad-hoc durante a migração 3D. Esta categoria cobre tokens de layout, spacing, tipografia e superfície visual.

#### FDS.1 - Layout System

- [x] **PH6-FDS-001** - Definir grid, containers e gutters responsivos para telas 3D

  **Descrição curta:**
  - Padronizar largura máxima, gutters e alinhamento por breakpoint.
  - Evitar sobreposição inconsistente entre header fixo, blocos e camadas de cena.

  **Implementação sugerida:**
  - Criar tokens utilitários de container/gutter no `globals.css`.
  - Aplicar o sistema em `HomeExperience` e `GalleryExperience`.
  - Documentar regras no bloco de notas da fase.

  **Arquivos/áreas afetadas:** `src/app/globals.css`, `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery-3d/GalleryExperience.tsx`

  **Critérios de aceitação:**
  - [x] Todas as seções usam o mesmo sistema de container/gutter por breakpoint.
  - [x] Não há clipping horizontal em `390px`, `768px`, `1024px`, `1440px`.

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 4h  
  **Dependências:** nenhuma  
  **Status:** 🟢 Concluída (2026-03-25)
  
  **Notas de implementação (PH6-FDS-001):**
  - Tokens responsivos adicionados no `globals.css`: `--layout-3d-max-width`, `--layout-3d-gutter`, `--layout-3d-columns`, `--layout-3d-column-gap`.
  - Novo utilitário `layout-3d-shell` aplicado em todas as seções de `HomeExperience` e `GalleryExperience`, unificando grid/containers/gutters.
  - Cobertura de regressão atualizada em `Home3DExperience.test.tsx` e `GalleryExperience.test.tsx` para garantir o contrato de layout.

#### FDS.2 - Spacing + Typography System

- [x] **PH6-FDS-002** - Definir escala de spacing e tipografia de sistema para experiência 3D

  **Descrição curta:**
  - Consolidar escala de espaçamento e tamanhos tipográficos por nível semântico.
  - Garantir consistência entre hero, cards, listas e CTAs.

  **Implementação sugerida:**
  - Criar tokens de spacing (`--space-*`) e rhythm vertical.
  - Criar mapa de tipo (Display, Title, Body, Meta, Label).
  - Aplicar classes/tokens nas seções-chave.

  **Arquivos/áreas afetadas:** `src/app/globals.css`, `tailwind.config.js`, `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery-3d/GalleryExperience.tsx`, `src/app/auth/signin/page.tsx`

  **Critérios de aceitação:**
  - [x] Escala tipográfica documentada e aplicada nos principais componentes.
  - [x] Espaçamento vertical previsível entre blocos (sem “saltos” visuais).

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 6h  
  **Dependências:** PH6-FDS-001  
  **Status:** 🟢 Concluída (2026-03-24)

  **Notas de implementação (PH6-FDS-002):**
  - Escala semântica criada no `globals.css` com tokens `--space-3d-*` e `--type-3d-*` por breakpoint.
  - Utilitários globais adicionados: `type-3d-display|title|title-sm|body-lg|body|meta|label|price` e `rhythm-3d-section|section-tight|stack-*`.
  - `tailwind.config.js` estendido com `spacing` e `fontSize` semânticos alinhados aos tokens de sistema.
  - Adoção aplicada em `HomeExperience`, `GalleryExperience` e `signin/page.tsx` para padronizar hierarquia visual e ritmo vertical.
  - Cobertura de regressão atualizada em `Home3DExperience.test.tsx`, `GalleryExperience.test.tsx` e novo `SignInPage.test.tsx`.

#### FDS.3 - Surface + Color Semantics

- [x] **PH6-FDS-003** - Definir semântica visual de superfície para composição com fundo 3D

  **Descrição curta:**
  - Padronizar níveis de superfície (`surface-1`, `surface-card`, `surface-emphasis`) e transparências.
  - Garantir contraste suficiente sobre fundos dinâmicos.

  **Implementação sugerida:**
  - Revisar tokens HSL e opacidades de cards.
  - Aplicar estilos de glass/backdrop de forma uniforme.
  - Ajustar variantes para light/dark.

  **Arquivos/áreas afetadas:** `src/app/globals.css`, `tailwind.config.js`, `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery-3d/GalleryExperience.tsx`

  **Critérios de aceitação:**
  - [x] Contraste AA para texto principal em cards/superfícies.
  - [x] Light e dark com legibilidade equivalente em áreas com gradiente.

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 4h  
  **Dependências:** PH6-FDS-002  
  **Status:** 🟢 Concluída (2026-03-25)

  **Notas de implementação (PH6-FDS-003):**
  - Tokens semânticos de superfície 3D adicionados no `globals.css`: `--surface-1-3d`, `--surface-card-3d`, `--surface-emphasis-3d`, `--surface-border-3d`, `--surface-border-3d-strong`, `--surface-shadow-3d` e `--surface-blur-3d` em light/dark.
  - Utilitários globais criados para padronização de composição sobre fundo dinâmico: `surface-3d-1`, `surface-3d-card`, `surface-3d-emphasis`.
  - `tailwind.config.js` atualizado com as cores semânticas `surface-3d-*` e `surface-border-3d*`, além da sombra `surface-3d`.
  - Aplicação uniforme dos níveis de superfície em `HomeExperience` e `GalleryExperience`, removendo opacidades ad-hoc repetidas.
  - Cobertura de regressão atualizada em `Home3DExperience.test.tsx` e `GalleryExperience.test.tsx` para exigir uso explícito das classes de superfície semântica.

### 📦 Layout + Scroll 3D - Narrativa visual e composição por profundidade

#### Objetivo
Estruturar a experiência como narrativa de scroll, com seções pensadas para progressão visual e leitura. Esta categoria cobre estrutura de página, depth layers e animação de imagens por scroll.

#### L3D.1 - Storyboard de Scroll

- [x] **PH6-L3D-001** - Definir storyboard de 5 atos para Home (hero → serviços → prova social → CTA)

  **Descrição curta:**
  - Definir blocos com objetivos narrativos e gatilhos de transição.
  - Relacionar cada ato com comportamento visual esperado.

  **Implementação sugerida:**
  - Criar mapa de progressão por seção.
  - Alinhar pontos de entrada de conteúdo com parallax/reveal.
  - Documentar timing por viewport.

  **Arquivos/áreas afetadas:** `src/components/home-3d/HomeExperience.tsx`, `src/components/home-3d/RevealBlock.tsx`

  **Critérios de aceitação:**
  - [x] Cada seção possui intenção e transição definidas.
  - [x] O fluxo mantém clareza de conteúdo em desktop e mobile.

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 4h  
  **Dependências:** PH6-FDS-001  
  **Status:** 🟢 Concluída (2026-03-25)

  **Notas de implementação (PH6-L3D-001):**
  - Storyboard de 5 atos formalizado em `HomeExperience` com contrato por seção: `id do ato`, `intenção narrativa`, `gatilho de transição`, `comportamento visual` e `timing por viewport`.
  - Cada seção da Home recebeu metadados `data-storyboard-*` para tornar explícita a progressão narrativa (hero → serviços → valor tangível → prova social → CTA).
  - `RevealBlock` evoluído para aceitar `revealByViewport` (mobile/desktop), preservando compatibilidade com a API anterior (`delay`/`y`) e mantendo fallback seguro para `prefers-reduced-motion`.
  - Testes de regressão atualizados em `Home3DExperience.test.tsx` e novo `RevealBlock.test.tsx` para validar contrato de storyboard e perfil de reveal por viewport.

#### L3D.2 - Scroll-driven Image Animation

- [x] **PH6-L3D-002** - Implementar animação de imagens orientada por scroll (parallax + depth)

  **Descrição curta:**
  - Aplicar deslocamento por eixo e escala leve em imagens/cards conforme progresso do scroll.
  - Preservar performance e evitar motion excessivo.

  **Implementação sugerida:**
  - Usar `motion` com `useScroll` e `useTransform` por seção.
  - Definir ranges por breakpoint.
  - Adicionar fallback estático em `prefers-reduced-motion`.

  **Arquivos/áreas afetadas:** `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery-3d/GalleryExperience.tsx`, `src/components/gallery.tsx`

  **Critérios de aceitação:**
  - [x] Imagens respondem ao scroll sem jitter perceptível.
  - [x] Reduced motion desativa animações contínuas e mantém usabilidade.

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 8h  
  **Dependências:** PH6-L3D-001  
  **Status:** 🟢 Concluída (2026-03-25)

  **Notas de implementação (PH6-L3D-002):**
  - Hook compartilhado `useScrollDepthMotion` criado com `useScroll + useTransform` e ranges por breakpoint (`mobile`/`desktop`) para padronizar parallax/depth em camadas 2D sobre cena 3D.
  - Home atualizada com camadas de depth observáveis em `hero`, `services`, `discovery` e `social proof` via contrato `data-scroll-depth*`.
  - Gallery 3D atualizada com depth no intro, pilares de valor, grid de coleções e shell do portfólio; componente-base `Gallery` também ganhou camada de parallax no grid de thumbnails.
  - Fallback de reduced motion preservado para animações contínuas através do gate de motion + media query, mantendo interação e leitura estáveis sem jitter perceptível.

#### L3D.3 - Header + Overlay Layering

- [ ] **PH6-L3D-003** - Corrigir estratégia de camadas (header fixo, menu mobile, modais/lightbox)

  **Descrição curta:**
  - Eliminar conflitos de z-index e sobreposição parcial.
  - Garantir comportamento consistente de overlays em mobile.

  **Implementação sugerida:**
  - Revisar z-index tokens por tipo de camada.
  - Garantir que menu mobile e lightbox bloqueiem interações de fundo.
  - Ajustar backdrop e estado aberto/fechado.

  **Arquivos/áreas afetadas:** `src/components/HeaderNavigation.tsx`, `src/components/MenuNavigation.tsx`, `src/components/gallery.tsx`, `src/app/layout.tsx`

  **Critérios de aceitação:**
  - [ ] Menu mobile cobre corretamente a interface e bloqueia clique no conteúdo.
  - [ ] Lightbox fica acima de header e elementos fixos.

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 5h  
  **Dependências:** PH6-L3D-002  
  **Status:** 🔴 Pendente

#### L3D.4 - Runtime Safety na Home

- [ ] **PH6-L3D-004** - Garantir resiliência de imagens dinâmicas sem quebrar render

  **Descrição curta:**
  - Evitar erro fatal da rota `/` quando imagens externas não estão configuradas.
  - Garantir fallback seguro para avatares e imagens remotas.

  **Implementação sugerida:**
  - Configurar hosts remotos em `next.config`.
  - Adicionar fallback/guard para URLs inválidas.
  - Cobrir com teste de render da Home.

  **Arquivos/áreas afetadas:** `next.config.ts`, `src/components/home-3d/HomeExperience.tsx`, `src/__tests__/Home3DExperience.test.tsx`

  **Critérios de aceitação:**
  - [ ] Rota `/` não retorna 500 por host de imagem externo.
  - [ ] Home renderiza com dados reais e fallback local quando necessário.

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 3h  
  **Dependências:** nenhuma  
  **Status:** 🔴 Pendente

### 📦 Motion + Interações - Sistema de movimento e comportamento

#### Objetivo
Definir uma linguagem de movimento consistente entre 2D/3D para reforçar percepção de qualidade e progressão. Esta categoria cobre tempos, easing, triggers e microinterações.

#### MSI.1 - Motion Tokens

- [ ] **PH6-MSI-001** - Formalizar motion tokens (tempo, easing, delay, intensidade)

  **Descrição curta:**
  - Definir padrões de animação reutilizáveis.
  - Evitar animações divergentes entre componentes.

  **Implementação sugerida:**
  - Criar constantes/tokens de motion.
  - Atualizar `RevealBlock` e transições de cards para usar o padrão.
  - Documentar guidelines da fase.

  **Arquivos/áreas afetadas:** `src/components/home-3d/RevealBlock.tsx`, `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery-3d/GalleryExperience.tsx`

  **Critérios de aceitação:**
  - [ ] Curvas/easing e durações padronizadas em Home e Gallery.
  - [ ] Não há animações com timing conflitante no mesmo fluxo.

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 4h  
  **Dependências:** PH6-L3D-001  
  **Status:** 🔴 Pendente

#### MSI.2 - Interaction States

- [ ] **PH6-MSI-002** - Definir estados de hover/focus/pressed para elementos clicáveis

  **Descrição curta:**
  - Garantir feedback visual consistente para botões, links, cards e itens de menu.
  - Cobrir mouse, touch e teclado.

  **Implementação sugerida:**
  - Padronizar estados com variantes utilitárias.
  - Revisar botões de CTA e links de navegação.
  - Validar foco visível em todas as interações principais.

  **Arquivos/áreas afetadas:** `src/components/ui/button.tsx`, `src/components/HeaderNavigation.tsx`, `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery.tsx`

  **Critérios de aceitação:**
  - [ ] Todos os elementos interativos exibem estado de foco acessível.
  - [ ] Hover/touch não alteram legibilidade do conteúdo.

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 4h  
  **Dependências:** PH6-MSI-001  
  **Status:** 🔴 Pendente

#### MSI.3 - 3D Scene Behavior

- [ ] **PH6-MSI-003** - Harmonizar comportamento da cena 3D (pointer, rotação, fallback)

  **Descrição curta:**
  - Ajustar intensidade de movimentos da câmera/objetos.
  - Garantir modo degradado em dispositivos de baixa capacidade.

  **Implementação sugerida:**
  - Revisar tiers (`high|medium|low`) e DPR.
  - Ajustar amplitude da câmera por breakpoint.
  - Reduzir custo em dispositivos móveis.

  **Arquivos/áreas afetadas:** `src/components/home-3d/HomeSceneBackdrop.tsx`, `src/components/home-3d/HomeSceneCanvas.tsx`, `src/components/gallery-3d/GallerySceneBackdrop.tsx`, `src/components/gallery-3d/GallerySceneCanvas.tsx`

  **Critérios de aceitação:**
  - [ ] Cena mantém estabilidade visual sem distração em mobile.
  - [ ] Queda de qualidade é gradual (sem “quebras” visuais abruptas).

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 6h  
  **Dependências:** PH6-L3D-002  
  **Status:** 🔴 Pendente

#### MSI.4 - Scroll Intent Validation

- [ ] **PH6-MSI-004** - Validar direção de movimento por intenção de UX

  **Descrição curta:**
  - Garantir que movimento reforça leitura e conversão, não apenas “efeito”.
  - Definir “hero moment” e microinterações de suporte.

  **Implementação sugerida:**
  - Revisar pontos de maior atenção visual.
  - Ajustar intensidade da animação por seção.
  - Incluir fallback para `prefers-reduced-motion`.

  **Arquivos/áreas afetadas:** `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery-3d/GalleryExperience.tsx`

  **Critérios de aceitação:**
  - [ ] Cada animação possui propósito funcional claro (descoberta, foco, CTA).
  - [ ] Não há animações “decorativas” que prejudiquem leitura.

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 3h  
  **Dependências:** PH6-MSI-003  
  **Status:** 🔴 Pendente

### 📦 Responsividade + A11y - Robustez de experiência multidevice

#### Objetivo
Garantir comportamento consistente em mobile/tablet/desktop com acessibilidade preservada e sem regressão de navegação.

#### RSP.1 - Breakpoint Contracts

- [ ] **PH6-RSP-001** - Definir contratos de layout por breakpoint

  **Descrição curta:**
  - Estabelecer regras objetivas para 390, 768, 1024 e 1440.
  - Evitar adaptação “manual” ad-hoc por componente.

  **Implementação sugerida:**
  - Criar tabela de comportamento por seção.
  - Ajustar containers e densidade visual por faixa.
  - Validar com capturas Playwright.

  **Arquivos/áreas afetadas:** `src/components/home-3d/HomeExperience.tsx`, `src/components/gallery-3d/GalleryExperience.tsx`, `src/components/HeaderNavigation.tsx`

  **Critérios de aceitação:**
  - [ ] Não há sobreposição de conteúdo em breakpoints alvo.
  - [ ] CTA primário permanece visível e acionável em mobile.

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 5h  
  **Dependências:** PH6-FDS-001  
  **Status:** 🔴 Pendente

#### RSP.2 - Accessible Navigation + Dialogs

- [ ] **PH6-RSP-002** - Corrigir semântica e comportamento de navegação/dialog em mobile

  **Descrição curta:**
  - Garantir aria states consistentes para menu e overlays.
  - Melhorar fluxo de teclado e leitura assistiva.

  **Implementação sugerida:**
  - Adicionar `aria-expanded` e controle de foco no menu mobile.
  - Garantir trap/fechamento no lightbox.
  - Revisar labels de botões/ações.

  **Arquivos/áreas afetadas:** `src/components/HeaderNavigation.tsx`, `src/components/gallery.tsx`, `src/components/MenuNavigation.tsx`

  **Critérios de aceitação:**
  - [ ] Menu mobile comunica estado aberto/fechado via ARIA.
  - [ ] Lightbox fecha por ESC e retorna foco ao gatilho.

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 4h  
  **Dependências:** PH6-L3D-003  
  **Status:** 🔴 Pendente

#### RSP.3 - Reduced Motion + Theme Consistency

- [ ] **PH6-RSP-003** - Garantir consistência de tema e reduced-motion em todos os fluxos

  **Descrição curta:**
  - Validar dark/light e fallback visual em cenários com animação desativada.
  - Evitar transições que desrespeitem preferências do usuário.

  **Implementação sugerida:**
  - Auditar blocos `motion` e componentes 3D.
  - Testar tema claro/escuro com e sem animação.
  - Ajustar contraste onde necessário.

  **Arquivos/áreas afetadas:** `src/components/home-3d/*`, `src/components/gallery-3d/*`, `src/components/ThemeToggle.tsx`, `src/providers/ThemeProvider.tsx`

  **Critérios de aceitação:**
  - [ ] `prefers-reduced-motion` remove animações críticas de deslocamento.
  - [ ] Tema claro/escuro mantém contraste e legibilidade equivalentes.

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 4h  
  **Dependências:** PH6-MSI-001  
  **Status:** 🔴 Pendente

### 📦 Performance + QA - Estabilidade e validação final

#### Objetivo
Definir orçamento mínimo de performance e garantir validação automatizada da fase antes de fechar o ciclo.

#### PQA.1 - Performance Budget 3D

- [ ] **PH6-PQA-001** - Estabelecer orçamento de performance para Home/Gallery 3D

  **Descrição curta:**
  - Definir metas de FPS e limites de render em dispositivos alvo.
  - Evitar regressão de CPU/GPU após incremento de motion.

  **Implementação sugerida:**
  - Medir em desktop e mobile com throttling.
  - Ajustar DPR, quantidade de objetos e efeitos.
  - Registrar baseline e meta final.

  **Arquivos/áreas afetadas:** `src/components/home-3d/HomeSceneCanvas.tsx`, `src/components/gallery-3d/GallerySceneCanvas.tsx`, `docs/development/tasks/PHASE-06-3d-scroll-design-migration.md`

  **Critérios de aceitação:**
  - [ ] Desktop: ~50-60 FPS em fluxo padrão.
  - [ ] Mobile médio: ~30 FPS estável com fallback de qualidade ativo.

  **Prioridade:** 🔴 Crítica  
  **Estimativa:** 6h  
  **Dependências:** PH6-MSI-003  
  **Status:** 🔴 Pendente

#### PQA.2 - Testes de Regressão Frontend

- [ ] **PH6-PQA-002** - Expandir cobertura de testes para fluxos críticos de Home/Gallery/Auth

  **Descrição curta:**
  - Cobrir render de páginas e interações críticas pós-migração.
  - Evitar regressões em runtime e acessibilidade básica.

  **Implementação sugerida:**
  - Adicionar smoke tests e cenários de menu mobile/lightbox.
  - Cobrir fallback de imagens externas e reduced motion.
  - Validar snapshots funcionais mínimos.

  **Arquivos/áreas afetadas:** `src/__tests__/Home3DExperience.test.tsx`, `src/__tests__/GalleryExperience.test.tsx`, `src/__tests__/GallerySceneBackdrop.test.tsx`, `src/__tests__/HomeSceneBackdrop.test.tsx`

  **Critérios de aceitação:**
  - [ ] Testes críticos de Home/Gallery executam sem regressão.
  - [ ] Cenários de menu mobile e lightbox cobertos.

  **Prioridade:** 🟡 Alta  
  **Estimativa:** 5h  
  **Dependências:** PH6-L3D-004, PH6-RSP-002  
  **Status:** 🔴 Pendente

---

## 🧪 Testes e Validações

- **Suites necessárias:** Jest + React Testing Library (smoke e interações), auditoria visual com Playwright.
- **Cobertura alvo:** manter e evoluir cobertura de Home/Gallery/Auth para regressões críticas.
- **Comandos de verificação:** `npm run lint:check`, `npm run type-check`, `npm test -- Home3DExperience`, `npm test -- GalleryExperience`, `npm test -- AuthWarning`, `npm test -- SignInForm`
- **Estado atual:** ⚠️ Em falha parcial (`/` quebra com host remoto de imagem não configurado; lint global com ruído por diretórios de build/backups)

---

## 📚 Documentação e Comunicação

- Atualizar `docs/development/tasks/TASKS.md` com referência desta fase quando iniciar execução.
- Atualizar `docs/development/CHANGELOG.md` sob `[Unreleased]` ao concluir blocos da fase.
- Registrar decisões de motion/layout neste arquivo para evitar divergência entre PRs.
- Se houver mudança de config de imagens/asset pipeline, documentar em `README.md` e `docs/development/README.md`.

---

## ✅ Checklist de Encerramento da Fase

- [ ] Todas as tarefas da fase concluídas com status atualizado.
- [ ] Home e Gallery validadas em desktop/mobile com comportamento 3D consistente.
- [ ] Runtime `/` estável sem erro fatal de `next/image`.
- [ ] Lint/type-check sem novos erros críticos no frontend.
- [ ] Testes de regressão de Home/Gallery/Auth atualizados e executados.
- [ ] Documentação de task/changelog atualizada.
- [ ] Aprovação final registrada em PR/issue.

Ao finalizar, mover para estado “ARQUIVADA” e registrar nota histórica no topo com data e resumo de entregas.
