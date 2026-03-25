# PH6-MSI-001 - Log Tecnico

## Resumo
Formalizacao de motion tokens (tempo, easing, delay e intensidade) para Home/Gallery 3D, removendo timings hardcoded e alinhando o comportamento de reveal, hover e stagger em um contrato reutilizavel.

## Escopo tecnico
- Tokens centralizados: `src/lib/motion-tokens.ts`
- Reveal padronizado: `src/components/home-3d/RevealBlock.tsx`
- Home migrada para tokens: `src/components/home-3d/HomeExperience.tsx`
- Gallery migrada para tokens: `src/components/gallery-3d/GalleryExperience.tsx`
- Cobertura de motion tokens: `src/__tests__/motionTokens.test.ts`
- Cobertura de fallback tokenizado no reveal: `src/__tests__/RevealBlock.test.tsx`
- Atualizacao de status da task: `docs/development/tasks/PHASE-06-3d-scroll-design-migration.md`

## Decisoes e trade-offs
1. Criar um modulo unico (`motion-tokens.ts`) com escalas nomeadas (`duration`, `easing`, `delay`, `intensity`) para evitar divergencia entre componentes.
2. Preservar compatibilidade da API de `RevealBlock` (`delay`, `y`, `revealByViewport`) e aplicar tokens apenas como fallback/preset.
3. Migrar Home e Gallery para usar tokens em reveal/hover/stagger, priorizando consistencia de narrativa ao inves de valores ad-hoc por secao.
4. Manter a semantica de reduced motion e contratos `data-*` existentes para nao introduzir regressao de acessibilidade.

## Evidencias TDD
- RED:
  - Comando: `npm test -- src/__tests__/motionTokens.test.ts src/__tests__/RevealBlock.test.tsx`
  - Resultado: falha esperada (`Could not locate module @/lib/motion-tokens`).
- GREEN:
  - Mesmo comando apos implementacao.
  - Resultado: `2/2` suites passando (`7/7` testes).

## Verificacoes finais
- `npm test -- src/__tests__/motionTokens.test.ts src/__tests__/RevealBlock.test.tsx`
  - Resultado: passou (`2/2` suites).
- `npm test -- src/__tests__/Home3DExperience.test.tsx src/__tests__/GalleryExperience.test.tsx`
  - Resultado: passou (`2/2` suites).
- `npm run lint`
  - Resultado: falha global pre-existente no repositorio (`.next_backup_20260324_3dhome` e backlog amplo de lint fora do escopo).
- `npx eslint <arquivos alterados da task>`
  - Resultado: passou sem erros nos arquivos alterados desta entrega.
- `npm run build`
  - Resultado: concluido com sucesso (exit code 0), com warnings conhecidos e logs de indisponibilidade do banco durante prerender (fallback da Home mantido).

## Documentacao atualizada
- `docs/development/tasks/PHASE-06-3d-scroll-design-migration.md`
- `docs/ROADMAP/Logs/PH6-MSI-001.md`
