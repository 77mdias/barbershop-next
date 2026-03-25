# PH6-PQA-001 - Log Tecnico

## Resumo
Formalizacao do orçamento de performance das cenas 3D da Home e Gallery, com metas de FPS e limites de render por tier para reduzir risco de regressao em CPU/GPU.

## Escopo tecnico
- Contrato de budget: `src/components/scene-3d/performanceBudget.ts`
- Aplicacao na Home: `src/components/home-3d/HomeSceneCanvas.tsx`
- Aplicacao na Gallery: `src/components/gallery-3d/GallerySceneCanvas.tsx`
- Regressao automatizada: `src/__tests__/ScenePerformanceBudget.test.ts`

## Decisoes e trade-offs
1. Centralizar metas e limites em modulo unico para evitar drift entre cenas 3D.
2. Reduzir DPR e antialias em tier `low` para privilegiar estabilidade em mobile medio.
3. Cortar complexidade geometrica (segmentos) e intensidade de motion por tier para diminuir custo de frame sem remover identidade visual.

## Baseline de orcamento
- Meta desktop: `50-60 FPS` em fluxo padrao.
- Meta mobile medio: `30 FPS` estavel com fallback de qualidade ativo.
- Guardrails por tier:
  - `maxDpr` por rota/tier.
  - `maxAnimatedObjects` por rota/tier.
  - Segmentacao geometrica de cilindros/torus por tier.
  - `antialias` desligado no tier `low`.

## Evidencias de validacao
- Teste dedicado cobre:
  - metas de FPS;
  - degradacao progressiva de limites (`high > medium > low`);
  - limites de geometria e objetos da Gallery no tier `low`.

## Verificacoes finais
- `npm run lint:check`
- `npm run build`
- `npm test -- ScenePerformanceBudget.test.ts HomeSceneBackdrop.test.tsx GallerySceneBackdrop.test.tsx`
