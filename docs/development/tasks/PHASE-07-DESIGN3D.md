
---

# TASK — Remodulagem da Home para experiência 3D premium

## Contexto

Estamos migrando a Home Page de uma aplicação web de barbearia de um layout premium estático para uma experiência visual avançada, moderna e performática, com foco em:

* estética premium
* animações suaves
* storytelling leve por scroll
* hero principal com modelo 3D `.glb` de uma maquininha de corte
* sensação visual inspirada em sites estilo Apple: clean, refinado, elegante, fluido e preciso
* performance real em produção, inclusive com fallback e degradação elegante para dispositivos mais fracos

A Home atual já possui identidade dark premium com acentos dourados, tipografia sofisticada e cards de serviços. A nova implementação deve preservar a identidade visual base, mas elevar drasticamente a percepção de modernidade, profundidade e sofisticação.

O modelo 3D da maquininha já existe em formato `.glb` otimizado, com peso aproximado de **7.5 MB**, e deve ser tratado como o **asset principal da hero**.

---

## Objetivo principal

Remodelar a Home Page inteira com foco prioritário na **nova Hero 3D**, criando uma experiência:

* premium
* cinematográfica
* minimalista
* fluida
* performática
* responsiva
* escalável para futuras animações 3D, vídeos, frames e experiências visuais mais avançadas

---

## Resultado esperado

Entregar uma nova Home Page com:

1. **Hero 3D premium**

   * headline forte
   * subtítulo curto
   * CTA principal
   * CTA secundário
   * modelo 3D da maquininha como protagonista
   * animação idle leve
   * entrada elegante no load
   * scroll animation suave e refinada

2. **Seções seguintes remoduladas**

   * benefícios
   * serviços populares
   * fluxo de agendamento
   * prova social
   * CTA final

3. **Arquitetura organizada**

   * separação clara entre UI, animação, cena 3D e hooks
   * código pronto para expansão futura

4. **Padrões de performance**

   * lazy loading
   * fallback visual
   * mobile degradation
   * baixo custo de render

---

# Restrições de design

## Direção visual obrigatória

A estética deve seguir estes princípios:

* inspirada em experiência Apple-like
* clean
* elegante
* escura
* refinada
* sem exageros gamer
* sem excesso de efeitos chamativos
* sem visual “genérico de IA”
* sem excesso de glassmorphism
* sem poluição visual
* sem múltiplos elementos brigando por atenção

## Sensação desejada

A Home deve transmitir:

* precisão
* tecnologia premium
* sofisticação
* modernidade
* fluxo suave
* confiança
* experiência high-end

## Sensação que NÃO queremos

Evitar aparência:

* futurista exagerada
* neon demais
* gamer demais
* cyberpunk
* carregada
* experimental demais
* pesada demais visualmente
* com animações agressivas ou rápidas demais

---

# Requisitos funcionais

## RF-001 — Nova Hero 3D

Criar uma Hero principal com:

* badge superior pequena
* headline central forte
* subtítulo explicativo curto
* CTA principal
* CTA secundário
* modelo 3D da maquininha ocupando papel de destaque visual
* glow de fundo sutil
* composição refinada com muito respiro

## RF-002 — Modelo 3D

Renderizar o modelo `.glb` da maquininha com:

* carregamento via React Three Fiber
* iluminação premium e suave
* posicionamento correto em desktop e mobile
* escala ajustada
* rotação idle sutil
* floating sutil
* sem jitter
* sem interações excessivas

## RF-003 — Entrada da Hero

No carregamento da página, a Hero deve apresentar:

* fade-in da badge
* entrada suave da headline
* entrada do subtítulo
* entrada dos CTAs
* entrada suave do modelo 3D
* transição refinada do estado inicial para o idle state

## RF-004 — Scroll storytelling da Hero

Ao scrollar a página:

* o modelo 3D deve responder suavemente
* a rotação deve mudar com elegância
* a posição pode ser levemente deslocada
* a câmera pode fazer aproximação leve
* o comportamento deve parecer natural e premium
* nada brusco ou agressivo

## RF-005 — Seção de benefícios

Criar uma seção curta e elegante logo após a hero, com 3 ou 4 benefícios da plataforma, como por exemplo:

* agendamento premium
* profissionais selecionados
* fluxo simples
* experiência moderna

Essa seção deve ter reveal sutil no scroll.

## RF-006 — Serviços populares

Reestruturar a seção já existente de serviços populares para manter a identidade premium, porém com:

* hierarquia mais limpa
* espaçamento melhor
* cards mais refinados
* animações de entrada suaves
* hover elegante

## RF-007 — Fluxo de agendamento

Criar uma seção explicando o processo da plataforma em poucos passos:

* escolha o serviço
* encontre o barbeiro
* selecione horário
* confirme o agendamento

Essa seção deve ser visualmente simples, clara e sofisticada.

## RF-008 — Prova social

Adicionar seção de avaliações, números ou depoimentos curtos com design premium e leve.

## RF-009 — CTA final

Adicionar uma seção final com chamada clara para ação, reforçando a proposta premium da experiência.

## RF-010 — Fallback

Caso o modelo 3D ainda não tenha carregado ou WebGL esteja indisponível:

* exibir imagem/poster estático da maquininha
* manter a hero bonita e íntegra
* evitar quebra visual

---

# Requisitos não funcionais

## RNF-001 — Performance

A Home precisa ser otimizada para performance real.

Obrigatório:

* lazy load da cena 3D
* limite de DPR
* evitar re-renders desnecessários
* evitar animações contínuas com React state
* evitar efeitos pesados sem necessidade
* manter a experiência fluida em dispositivos medianos

## RNF-002 — Responsividade

A Home deve funcionar bem em:

* desktop
* tablet
* mobile

A versão mobile deve ser uma adaptação elegante, não uma cópia exata da desktop.

## RNF-003 — Escalabilidade

A estrutura deve ficar pronta para futuras expansões, como:

* novas seções 3D
* variações da hero
* novos assets visuais
* vídeos e frames em outras páginas

## RNF-004 — Manutenibilidade

O código precisa ser:

* limpo
* modular
* sem acoplamento desnecessário
* fácil de evoluir

## RNF-005 — Acessibilidade

Manter boa legibilidade, contraste adequado e estrutura semântica razoável.

---

# Stack obrigatória

## Base

* Next.js
* TypeScript
* Tailwind CSS

## Animações de interface

* Motion

## Scroll orchestration

* GSAP
* ScrollTrigger

## 3D

* three.js
* @react-three/fiber
* @react-three/drei

---

# Regra de uso das libs

## Motion

Usar para:

* entrada de textos
* entrada de badges
* entrada de CTAs
* reveal de seções
* hover states
* microinterações

Não usar para:

* mover câmera 3D
* controlar timeline complexa do modelo 3D

## GSAP + ScrollTrigger

Usar para:

* timeline da hero ligada ao scroll
* scrub suave
* rotação/posição do modelo
* ajuste fino de narrativa visual entre hero e seção seguinte

Não usar para:

* pequenas animações simples de UI que Motion resolve melhor

## React Three Fiber

Usar para:

* canvas
* renderização do modelo
* luzes
* câmera
* loop de animação leve
* base da cena 3D

## Three.js

Usar para:

* suporte técnico de materiais
* loaders
* estrutura 3D
* ajustes finos

---

# Diretrizes de performance obrigatórias

## P-001

Não usar `setState` para animação contínua do modelo.

## P-002

Usar `useFrame` apenas para animações leves, como:

* idle rotation
* floating sutil

## P-003

A timeline ligada ao scroll deve agir em refs/mutações, não em re-render React.

## P-004

Configurar o Canvas com algo próximo de:

```tsx
dpr={[1, 1.5]}
```

## P-005

Evitar sombras complexas no MVP inicial.

## P-006

Evitar pós-processamento pesado no MVP.

## P-007

Usar lazy loading para o bloco 3D.

## P-008

Criar fallback estático para ausência de WebGL ou carregamento lento.

## P-009

Em mobile:

* reduzir intensidade de animação
* reduzir deslocamentos
* simplificar narrativa 3D
* priorizar legibilidade e CTA

## P-010

Não colocar múltiplos elementos 3D pesados simultaneamente na hero.

---

# Estrutura de pastas esperada

```txt
src/
  app/
    (marketing)/
      page.tsx

  components/
    home/
      hero/
        Hero3D.tsx
        HeroContent.tsx
        HeroScene.tsx
        HeroOverlay.tsx
        HeroLoader.tsx
      sections/
        BenefitsSection.tsx
        ServicesSection.tsx
        HowItWorksSection.tsx
        TestimonialsSection.tsx
        FinalCTASection.tsx

    three/
      BarberClipperModel.tsx
      SceneLights.tsx
      SceneCameraRig.tsx
      SceneEnvironment.tsx
      ModelFallback.tsx

  hooks/
    useHeroScrollTimeline.ts
    useReducedMotionSafe.ts
    useIsMobile.ts
    useWebGLSupport.ts

  lib/
    animation/
      motion-presets.ts
      gsap.ts
    three/
      model-config.ts
      performance.ts

public/
  models/
    barber-clipper.glb
    barber-clipper-poster.webp
```

---

# Hero — comportamento esperado

## Composição desktop

A Hero deve ser composta por:

### Lado textual

* badge
* headline principal forte
* subtítulo curto
* CTA principal
* CTA secundário

### Lado visual

* maquininha 3D em destaque
* glow suave de fundo
* overlays mínimos e discretos
* nada competindo com o modelo

## Composição mobile

* headline primeiro
* modelo 3D abaixo
* CTA visível rapidamente
* simplificação dos detalhes decorativos

---

# Hierarquia visual esperada

## Prioridade 1

Headline + maquininha 3D

## Prioridade 2

Subtítulo + CTA principal

## Prioridade 3

CTA secundário + detalhes pequenos

## Prioridade 4

Elementos decorativos

---

# Mudanças obrigatórias em relação ao layout atual

1. Remover o card da direita como protagonista da Hero.
2. Transferir o protagonismo visual da área direita para o modelo 3D.
3. Reduzir competição entre elementos visuais.
4. Melhorar o respiro entre headline e demais elementos.
5. Deixar a hero mais cinematográfica e menos “grid de landing tradicional”.
6. Reorganizar a seção seguinte para continuar naturalmente a narrativa.

---

# Copy direction

A copy deve seguir um tom:

* sofisticado
* curto
* premium
* confiante
* elegante
* sem exagero publicitário

Evitar textos longos na hero.

---

# Exemplo de copy aceitável para a Hero

## Badge

`NOVA EXPERIÊNCIA 3D`

## Headline

`Precisão visual para um agendamento premium.`

## Subheadline

`Escolha serviços, descubra barbeiros e agende com uma experiência moderna, fluida e sofisticada.`

## CTA principal

`Agendar agora`

## CTA secundário

`Explorar serviços`

Esses textos podem ser refinados, mas devem manter essa direção.

---

# Implementação esperada

## Etapa 1 — Criar a nova estrutura da Home

Refatorar a Home Page em componentes modulares.

## Etapa 2 — Criar Hero 3D

Criar:

* `Hero3D`
* `HeroContent`
* `HeroScene`
* `HeroOverlay`
* `HeroLoader`

## Etapa 3 — Integrar o modelo `.glb`

Adicionar o modelo 3D via R3F.

## Etapa 4 — Criar idle animation

Adicionar:

* rotação leve
* floating leve
* comportamento premium

## Etapa 5 — Criar scroll timeline

Adicionar GSAP + ScrollTrigger para:

* rotação extra
* deslocamento suave
* transição visual refinada

## Etapa 6 — Adicionar fallback

Criar poster estático e fallback sem WebGL.

## Etapa 7 — Reestruturar demais seções

Criar:

* Benefits
* Services
* How It Works
* Testimonials
* Final CTA

## Etapa 8 — Refinar performance

Aplicar lazy loading, redução de motion em mobile e limpeza de renderizações.

---

# Critérios de aceite

O trabalho será considerado completo quando:

1. A nova Home estiver visualmente muito superior à atual.
2. A Hero 3D estiver integrada de forma elegante.
3. O modelo 3D estiver bem posicionado, iluminado e com animação suave.
4. O scroll storytelling estiver funcionando com suavidade.
5. A experiência mobile estiver adaptada corretamente.
6. A arquitetura estiver modular e limpa.
7. A performance estiver tratada com responsabilidade.
8. Houver fallback estático para ausência de WebGL ou carregamento.
9. O resultado final transmitir sofisticação premium, não exagero visual.

---

# Entregáveis obrigatórios

## E-001

Código completo da nova Home.

## E-002

Componentes organizados por seção.

## E-003

Cena 3D funcional com a maquininha.

## E-004

Timeline GSAP funcional.

## E-005

Animações de UI com Motion.

## E-006

Fallback estático.

## E-007

Responsividade desktop/mobile.

## E-008

Código limpo e comentado quando necessário.

---

# Exemplo real mínimo de implementação

## `page.tsx`

```tsx
import { Hero3D } from "@/components/home/hero/Hero3D";
import { BenefitsSection } from "@/components/home/sections/BenefitsSection";
import { ServicesSection } from "@/components/home/sections/ServicesSection";
import { HowItWorksSection } from "@/components/home/sections/HowItWorksSection";
import { TestimonialsSection } from "@/components/home/sections/TestimonialsSection";
import { FinalCTASection } from "@/components/home/sections/FinalCTASection";

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <Hero3D />
      <BenefitsSection />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FinalCTASection />
    </main>
  );
}
```

## `Hero3D.tsx`

```tsx
"use client";

import dynamic from "next/dynamic";
import { HeroContent } from "./HeroContent";

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

export function Hero3D() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(214,153,45,0.18),transparent_28%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_40%)]" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-24 lg:grid-cols-2 lg:px-10">
        <HeroContent />
        <HeroScene />
      </div>
    </section>
  );
}
```

## `HeroScene.tsx`

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { BarberClipperModel } from "@/components/three/BarberClipperModel";
import { SceneLights } from "@/components/three/SceneLights";

export function HeroScene() {
  return (
    <div className="relative h-[420px] w-full lg:h-[720px]">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 4.5], fov: 32 }}
      >
        <Suspense fallback={null}>
          <SceneLights />
          <BarberClipperModel />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

## `BarberClipperModel.tsx`

```tsx
"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function BarberClipperModel() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/barber-clipper.glb");

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.5) * 0.18;
    group.current.rotation.x = Math.cos(t * 0.35) * 0.04;
    group.current.position.y = Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group ref={group} scale={1.4} position={[0, -0.3, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/barber-clipper.glb");
```

---

# Regras importantes para o agente

## Fazer

* priorizar clareza visual
* priorizar suavidade
* priorizar arquitetura limpa
* priorizar performance
* usar o 3D como protagonista controlado
* tratar mobile com estratégia própria

## Não fazer

* não exagerar em efeitos
* não transformar a hero em showcase bagunçado
* não criar animações rápidas ou agressivas
* não depender de re-renders contínuos
* não criar visual gamer
* não adicionar elementos supérfluos

---

# Definição final de sucesso

A entrega ideal deve fazer o usuário olhar a Home e sentir:

* “isso está muito mais premium”
* “o 3D ficou elegante”
* “parece produto real de alto nível”
* “está moderno, mas não exagerado”
* “está sofisticado e suave”
* “ficou bonito e profissional de verdade”

---
