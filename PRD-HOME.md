# 1. Direção da nova Home

## Objetivo

Transformar a home atual, que hoje está mais estática e baseada em blocos, em uma home com:

* sensação de produto premium
* foco visual imediato na maquininha 3D
* hierarquia mais forte entre headline, CTA e demonstração visual
* scroll com micro storytelling
* alto desempenho em desktop e versão degradada elegante em mobile

## Princípios visuais

* fundo escuro, mas não “preto chapado morto”
* iluminação suave e controlada
* animações lentas, precisas e com easing refinado
* pouco ruído visual
* 3D como protagonista, não como distração
* interface 2D servindo o 3D

---

# 2. Diagnóstico rápido da Hero atual

Sua hero atual tem boa base visual, mas hoje ela transmite mais:

* landing page premium
* catálogo/marketplace de serviços
* interface elegante, porém ainda tradicional

Ela ainda não comunica tanto:

* inovação
* impacto visual memorável
* sensação de software “next-gen”
* profundidade e movimento

O maior salto virá de:

1. **reposicionar a composição**
2. **dar protagonismo total ao 3D**
3. **tirar o card da direita do papel de rival da headline**
4. **fazer o scroll contar uma história leve**

---

# 3. Nova arquitetura da Home

## Estrutura ideal da página

### Seção 1 — Hero Cinemática

Objetivo: causar impacto imediato.

Conteúdo:

* headline forte
* subtítulo curto
* CTA principal
* CTA secundário
* maquininha 3D como asset central
* fundo com glow suave
* micro movimento idle
* entrada cinematográfica no load

### Seção 2 — Benefícios / Experiência

Objetivo: converter sensação visual em valor do produto.

Conteúdo:

* 3 ou 4 pilares
* “Agendamento premium”
* “Profissionais selecionados”
* “Fluxo simples”
* “Experiência moderna”

### Seção 3 — Serviços Populares

Objetivo: manter o que já existe, mas com apresentação mais refinada.

Conteúdo:

* cards com hover suave
* imagem ou ícone refinado
* highlight de tempo/preço
* animação de reveal por scroll

### Seção 4 — Como funciona

Objetivo: explicar o fluxo sem texto demais.

Conteúdo:

* Escolha serviço
* Compare unidades
* Agende
* Confirme
* tudo com motion progressivo

### Seção 5 — Social proof / Avaliações

Objetivo: reforçar confiança.

### Seção 6 — CTA final

Objetivo: fechamento limpo e forte.

---

# 4. Estrutura técnica da Hero nova

## Layout recomendado

Em vez da hero atual em “texto à esquerda e card à direita”, eu faria:

### Desktop

* bloco textual à esquerda/centro-esquerda
* maquininha 3D ocupando centro-direita com mais presença
* elementos flutuantes pequenos ao redor do modelo
* card secundário reduzido ou removido do hero principal

### Mobile

* headline no topo
* modelo 3D abaixo
* CTA abaixo do 3D
* sem excesso de overlays

---

# 5. PRD técnico da remodulagem

## Nome

**HOME-3D-001 — Remodulagem da Home com Hero 3D premium**

## Objetivo do projeto

Reestruturar a Home Page para uma experiência visual premium, moderna e performática, centrada em um modelo 3D de maquininha de corte, com animações suaves estilo Apple e storytelling leve por scroll.

## Problema atual

A home atual possui boa estética premium, porém ainda apresenta estrutura visual tradicional e pouca diferenciação interativa. A ausência de um elemento hero com profundidade reduz o impacto percebido da marca e limita a percepção de modernidade do software.

## Meta principal

Criar uma nova Home que:

* aumente a percepção de sofisticação
* torne a interface memorável
* mantenha clareza de uso
* preserve performance
* funcione bem em desktop e mobile

## KPIs técnicos

* LCP aceitável em conexão média
* sem travamentos perceptíveis na hero
* FPS estável em desktop moderno
* fallback elegante em devices fracos
* sem layout shift relevante na hero

## Escopo do MVP visual

Inclui:

* hero com maquininha 3D
* microanimações de entrada
* scroll animation da cena
* reorganização da hierarquia visual
* reveal animations nas seções subsequentes
* otimização de carregamento do asset 3D

Não inclui inicialmente:

* pós-processamento pesado
* física complexa
* múltiplos modelos 3D simultâneos
* partículas densas
* interações 3D altamente complexas com raycasting avançado em toda a home

## Requisitos funcionais

* renderizar modelo `.glb`
* exibir loading state elegante
* suportar rotação/idle animation automática
* suportar animação por scroll
* manter conteúdo textual utilizável sem dependência do 3D
* oferecer fallback estático caso WebGL falhe ou device esteja fraco

## Requisitos não funcionais

* responsivo
* acessível
* carregamento progressivo
* degradar com elegância
* evitar re-renderizações desnecessárias
* código modular e escalável

---

# 6. Organização ideal das libs

## Papel de cada lib

### Motion

Use para:

* entrada de headline
* fade/slide de CTA
* reveal de seções
* hover de botões/cards
* microinterações de UI

Não use para:

* animação principal do modelo 3D
* timeline complexa ligada à câmera 3D

---

### GSAP + ScrollTrigger

Use para:

* timeline da hero
* scrub no scroll
* mover câmera
* alterar rotação/posição do modelo
* sincronizar transições entre seções

Não use para:

* pequenas interações comuns de UI que Motion resolve melhor

---

### React Three Fiber

Use para:

* renderização da maquininha
* luzes
* câmera
* posicionamento do modelo
* loop de animação leve
* interação controlada com scroll

---

### Three.js

Use como base técnica e para:

* loaders
* materiais
* ajustes finos de cena
* utilidades 3D específicas

---

# 7. Estrutura de pastas recomendada

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
    useReducedMotion.ts
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

# 8. Arquitetura de composição da Hero

## Componente raiz

`Hero3D.tsx`

Responsabilidade:

* layout geral da hero
* integração entre conteúdo textual e canvas 3D
* decidir fallback mobile/performance mode

### Subcomponentes

#### `HeroContent.tsx`

* headline
* subtítulo
* CTA principal
* CTA secundário
* badge premium

#### `HeroScene.tsx`

* Canvas do R3F
* câmera
* luzes
* modelo 3D
* animação base

#### `HeroOverlay.tsx`

* glow gradients
* labels pequenas
* indicadores visuais sutis

#### `HeroLoader.tsx`

* estado de carregamento
* transição do poster estático para o 3D real

---

# 9. Exemplo real de comportamento da Hero

## Sequência de entrada

### No load

* fundo aparece primeiro
* glow leve
* headline entra com fade + y pequeno
* subtítulo entra em seguida
* CTA entra por último
* maquininha surge com opacity + slight scale + rotação inicial mínima

### Idle state

* rotação extremamente sutil
* leve floating
* highlight/luz suave sobre metal/plástico

### Scroll

Ao iniciar scroll:

* modelo se desloca um pouco
* câmera aproxima levemente
* rotação muda de eixo
* headline perde protagonismo
* próxima seção entra com continuidade

Estilo:

* tudo lento
* nada brusco
* nada “explodindo”
* sensação de precisão

---

# 10. Exemplo prático de implementação

## Hero da página

```tsx
import { Hero3D } from "@/components/home/hero/Hero3D";
import { BenefitsSection } from "@/components/home/sections/BenefitsSection";
import { ServicesSection } from "@/components/home/sections/ServicesSection";

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <Hero3D />
      <BenefitsSection />
      <ServicesSection />
    </main>
  );
}
```

## Hero3D

```tsx
"use client";

import { HeroContent } from "./HeroContent";
import { HeroScene } from "./HeroScene";

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

## HeroContent

```tsx
"use client";

import { motion } from "motion/react";

export function HeroContent() {
  return (
    <div className="max-w-2xl">
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-5 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs tracking-[0.24em] text-amber-300"
      >
        NOVA EXPERIÊNCIA 3D
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="font-serif text-5xl italic leading-[0.95] text-white sm:text-6xl lg:text-7xl"
      >
        Precisão visual para um agendamento premium.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-6 max-w-xl text-base leading-8 text-white/70 sm:text-lg"
      >
        Escolha serviços, descubra barbeiros e agende com uma experiência moderna, fluida e sofisticada.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-4"
      >
        <button className="rounded-2xl bg-amber-500 px-6 py-3 font-medium text-black transition-transform duration-300 hover:scale-[1.02]">
          Agendar agora
        </button>
        <button className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur">
          Explorar serviços
        </button>
      </motion.div>
    </div>
  );
}
```

## HeroScene

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

## Model component

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

## Luzes

```tsx
export function SceneLights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-2, -1, -3]} intensity={0.6} />
      <pointLight position={[0, 2, 2]} intensity={1.2} />
    </>
  );
}
```

---

# 11. Exemplo de scroll animation real com GSAP

A melhor abordagem aqui é o GSAP controlar um `ref` do grupo ou da câmera, não React state.

## Hook

```tsx
"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHeroScrollTimeline(
  triggerRef: React.RefObject<HTMLElement>,
  target: React.RefObject<{ rotation: { x: number; y: number; z: number }; position: { x: number; y: number; z: number } }>
) {
  useLayoutEffect(() => {
    if (!triggerRef.current || !target.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      tl.to(target.current!.rotation, {
        y: 0.8,
        x: 0.15,
      });

      tl.to(
        target.current!.position,
        {
          y: -0.2,
          x: 0.25,
        },
        0
      );
    }, triggerRef);

    return () => ctx.revert();
  }, [triggerRef, target]);
}
```

---

# 12. Padrões de performance que você deve seguir

## Regras principais

### 1. Um asset 3D principal por seção

Na home, deixe a maquininha ser o protagonista.
Não encha a hero de múltiplos meshes independentes decorativos.

### 2. Não use state React para animação contínua

Nada de `setState` em loop para rotação, posição ou câmera.

### 3. Limite o DPR

Use:

```tsx
dpr={[1, 1.5]}
```

ou no máximo `2` em telas premium específicas.

### 4. Use canvas só onde realmente precisa

Não espalhe WebGL na página inteira sem necessidade.

### 5. Use poster estático como fallback

Antes do modelo carregar:

* mostre uma imagem renderizada da maquininha
* depois troque suavemente para o canvas

### 6. Mobile deve degradar

Em mobile:

* menos movimento
* menos luz
* sem timeline pesada
* eventualmente uma versão 3D mais estática

### 7. Reduza textura antes de mexer em shader

Na maioria das vezes, o peso está nas texturas e não no código.

### 8. Evite shadow maps pesados no começo

Comece sem sombras reais.
Crie profundidade com iluminação e composição antes de ligar sombras complexas.

### 9. Não exagere em postprocessing

Bloom, DOF e coisas assim podem destruir performance rápido.

### 10. Faça lazy load da parte 3D

A hero pode até carregar cedo, mas o bundle do 3D deve ser separado.

---

# 13. Estratégia de responsividade

## Desktop

* experiência completa
* timeline por scroll
* modelo maior
* luzes mais refinadas

## Tablet

* experiência intermediária
* menos deslocamento da câmera
* cena mais simples

## Mobile

* modelo menor
* rotação leve
* sem scroll narrative complexa
* foco em CTA e legibilidade

---

# 14. Roadmap de implementação

## Fase 1 — Base

* importar GLB
* criar HeroScene
* iluminar bem
* posicionar modelo
* criar HeroContent novo

## Fase 2 — Entrada

* animações de entrada com Motion
* loading state elegante
* poster/fallback

## Fase 3 — Scroll

* timeline GSAP
* rotação suave da maquininha
* deslocamento leve da câmera

## Fase 4 — Seções seguintes

* benefits
* services com reveal
* testimonials
* CTA final

## Fase 5 — Performance

* medir bundle
* testar em mobile
* reduzir motion onde necessário
* revisar textura/luzes

---

# 15. O que eu mudaria no seu hero atual, de forma objetiva

1. removeria o card da direita como elemento dominante
2. colocaria a maquininha 3D nesse espaço
3. reduziria o search box dentro da hero ou o transformaria em CTA secundário
4. deixaria a headline mais “cinematográfica”
5. aumentaria o respiro vertical
6. adicionaria iluminação de fundo sutil
7. usaria menos blocos competindo entre si
8. faria a seção seguinte “puxar” o scroll da hero

---

# 16. Stack final recomendado para sua aplicação

## Base

* Next.js
* TypeScript
* Tailwind

## UI animation

* Motion

## Scroll orchestration

* GSAP + ScrollTrigger

## 3D

* Three.js
* React Three Fiber
* Drei

## Utilitários úteis

* `dynamic()` do Next para lazy load do canvas
* `useReducedMotion`
* detector de WebGL
* opcionalmente `Leva` só em desenvolvimento para ajustar luz/câmera

---

# 17. Decisão técnica resumida

## O que usar para cada coisa

* entrada da UI: **Motion**
* hover e microinteração: **Motion**
* scroll ligado à cena: **GSAP**
* render do modelo: **R3F**
* controle fino 3D: **Three**

Esse é o arranjo mais limpo e escalável para o seu caso.

---

# 18. Recomendação final para sua home

A melhor versão da sua home não é a mais “cheia”.
É a que faz isso:

* impressiona no primeiro segundo
* mantém leitura clara
* usa 3D com propósito
* continua rápida
* parece software premium, não experimento visual

Seu caso combina muito com:
**hero 3D elegante + narrativa curta + cards refinados + CTA forte**.

Se você quiser, no próximo passo eu monto para você um **TASK completo para o agente/Codex**, já em formato profissional, para ele implementar essa nova Home 3D na sua aplicação.
