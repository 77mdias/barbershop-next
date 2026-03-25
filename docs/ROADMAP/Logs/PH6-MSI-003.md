# PH6-MSI-003 - Log Tecnico

## Resumo
Harmonizacao do comportamento das cenas 3D de Home/Gallery com foco em estabilidade mobile: controle de pointer por perfil de interacao, suavizacao de rotacao/flutuacao por tier e fallback consistente sem WebGL.

## Escopo tecnico
- Normalizacao de tier + pointer mode: `src/components/home-3d/HomeSceneBackdrop.tsx`
- Camera rig com controle de pointer e movimento reduzido por tier: `src/components/home-3d/HomeSceneCanvas.tsx`
- Normalizacao de tier + pointer mode (gallery): `src/components/gallery-3d/GallerySceneBackdrop.tsx`
- Camera rig/rotacao com degradacao gradual por tier (gallery): `src/components/gallery-3d/GallerySceneCanvas.tsx`
- Cobertura de fallback sem WebGL (home): `src/__tests__/HomeSceneBackdrop.test.tsx`
- Cobertura de fallback sem WebGL (gallery): `src/__tests__/GallerySceneBackdrop.test.tsx`
- Atualizacao de status da task: `docs/development/tasks/PHASE-06-3d-scroll-design-migration.md`

## Decisoes e trade-offs
1. Introduzir `pointerMode` (`enabled|limited|disabled`) ao inves de remover pointer globalmente para preservar dinamismo em desktop e reduzir distração em mobile.
2. Degradar tier via viewport/pointer coarse no backdrop para manter configuracao centralizada e previsivel.
3. Escalonar `speed`, `rotationIntensity` e `floatIntensity` por tier para garantir queda gradual de qualidade sem quebras visuais abruptas.
4. Aplicar detecção de WebGL tambem na Home para paridade de fallback com Gallery.

## Verificacoes finais
- `npm test -- HomeSceneBackdrop.test.tsx GallerySceneBackdrop.test.tsx`
  - Resultado: passou (`2/2` suites, `8/8` testes).
- `npm run type-check`
  - Resultado: passou.
- `npx eslint src/components/home-3d/HomeSceneBackdrop.tsx src/components/home-3d/HomeSceneCanvas.tsx src/components/gallery-3d/GallerySceneBackdrop.tsx src/components/gallery-3d/GallerySceneCanvas.tsx src/__tests__/HomeSceneBackdrop.test.tsx src/__tests__/GallerySceneBackdrop.test.tsx`
  - Resultado: passou sem erros nos arquivos alterados.

## Documentacao atualizada
- `docs/development/tasks/PHASE-06-3d-scroll-design-migration.md`
- `docs/ROADMAP/Logs/PH6-MSI-003.md`
