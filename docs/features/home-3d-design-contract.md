# Home 3D Design Contract v1

Atualizado em: 24/03/2026
Escopo: `src/app/page.tsx` e seções Home fora da Hero (`HeroServices`, `PromoSection`, `SalonGrid`, `BookingCTA`, `Reviews`, `Footer`)

## 1. Objetivo e contexto

- Goal: manter a Home coesa com a Hero 3D, sem reduzir legibilidade, clareza de CTA e conversão.
- Audience and context: clientes de barbearia em fluxo mobile-first, com expectativa de experiência premium.
- Produto: landing page transacional (descoberta -> prova social -> ação de agendamento).

## 2. Direção criativa (Gate A)

### Goal addressed

- Definir uma direção visual não genérica, compatível com o tom premium-cinemático da Hero.

### Inputs consumed

- Hero 3D existente (`HeroSearch3D`, `HeroScene`), tokens globais (`src/app/globals.css`), estrutura das seções Home.

### Deliverables

- Conceito recomendado: `Cinematic Brass Layers`
  - narrativa: superfícies quentes, profundidade discreta, brilho metálico controlado e ritmo de leitura claro.
- Alternativas exploradas:
  - `Editorial Noir Grooming`: contraste mais forte, tipografia mais agressiva, menor calor cromático.
  - `Mechanical Atelier`: linguagem mais geométrica e técnica, maior densidade visual.
- Regras visuais:
  - 3D sempre decorativo e atrás do conteúdo textual.
  - Cartões e CTAs com contraste alto e foco em leitura.
  - Intensidade maior em `BookingCTA`; intensidade menor em `Footer`.
- Light/dark:
  - light: dourado suave e superfícies claras com textura baixa.
  - dark: brilho mais contido para não “estourar” contraste.

### Decisions and rationale

- Escolha do conceito `Cinematic Brass Layers`: mantém assinatura premium da Hero e reduz risco de ruído visual em listas e cards.

### Risks and open questions

- Risco: múltiplas cenas 3D em scroll longo aumentarem custo de GPU em mobile.
- Mitigação: qualidade por tier, pausa fora de viewport e fallback estático sem WebGL.

### Ready-for-next-gate checklist

- [x] Hierarquia visual por seção definida.
- [x] Intenção mobile e desktop explícita.
- [x] Restrições de contraste e legibilidade documentadas.

## 3. Plano de motion (Gate B)

### Goal addressed

- Definir comportamento de entrada, hover e resposta ao contexto (viewport/reduced-motion) sem quebrar UX primária.

### Inputs consumed

- Design direction do Gate A + estrutura atual dos componentes Home.

### Deliverables

- Entry: `stagger-reveal` mantido para blocos de conteúdo.
- Hover:
  - cards: elevação curta (`-translate-y-1`) e sombra controlada.
  - links/CTAs: deslocamento horizontal sutil no ícone.
- Scroll/state:
  - cenas 3D só animam quando seção entra em viewport.
- Reduced motion:
  - `prefers-reduced-motion` desativa animações de reveal/shimmer e interrompe animação de cena.

### Decisions and rationale

- Motion com peso médio e duração curta para reforçar percepção premium sem penalizar scan rápido.

### Risks and open questions

- Risco de inconsistência entre animações CSS e 3D.
- Mitigação: fallback global em `prefers-reduced-motion`.

### Ready-for-next-gate checklist

- [x] Triggers de motion definidos (entry/hover/viewport).
- [x] Fallback de acessibilidade definido.
- [x] Compatibilidade com 3D decorativo confirmada.

## 4. Escopo 3D e arquitetura (Gate C)

### Goal addressed

- Reaplicar profundidade 3D nas seções Home com arquitetura modular e baixo acoplamento.

### Inputs consumed

- Direção criativa e motion aprovados.

### Deliverables

- Módulos criados em `src/components/home/home3d`:
  - `quality.ts`: capability/WebGL e quality tiers.
  - `section3dConfig.ts`: contrato visual por seção (câmera, luz, meshes, fallback).
  - `SectionBackdropScene.tsx`: cena R3F reutilizável por variante.
  - `Section3DBackdrop.tsx`: integração client-side com pause fora de viewport.
- Integração nas seções:
  - `HeroServices`, `PromoSection`, `SalonGrid`, `BookingCTA`, `Reviews`, `Footer`.
- Escopo 3D:
  - decorativo/assistivo, sem interceptar interação (`pointer-events-none`).

### Decisions and rationale

- Um backdrop por seção (em vez de um canvas global) para manter semântica visual local e controle de intensidade por bloco.

### Risks and open questions

- Risco: custo agregado em dispositivos fracos.
- Mitigação: `dpr` adaptativo, limite de shapes por tier, `frameloop` condicional por viewport.

### Ready-for-next-gate checklist

- [x] Estratégia de render e assets definida.
- [x] Fallback low-end explícito.
- [x] UI principal preservada acima das camadas decorativas.

## 5. Performance budget e DoD

- Budget alvo:
  - desktop: 60 FPS estável.
  - mobile médio: 30-45 FPS estável.
  - low-end: DPR cap `1.0`, no shadows em seções.
- Constraints:
  - sem libs novas.
  - sem bloquear navegação/CTA principal.
- Definition of Done:
  - consistência visual com Hero 3D.
  - fallback sem WebGL.
  - reduced-motion respeitado.
  - zero findings high/critical no review final.
