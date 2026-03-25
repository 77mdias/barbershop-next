# PH6-RSP-003 - Log Tecnico

## Resumo

Garantida consistência entre tema (light/dark) e preferências de movimento reduzido nos fluxos principais de Home/Gallery e no controle global de tema.

## Alterações principais

- `ThemeProvider`
  - adicionada leitura/escuta de `prefers-reduced-motion` com atualização reativa;
  - estado de movimento reduzido refletido no DOM (`data-reduced-motion` no `document.documentElement`);
  - aplicação de `color-scheme` alinhada ao `resolvedTheme` para manter componentes nativos coerentes em dark/light.

- `HomeSceneBackdrop` e `GallerySceneBackdrop`
  - adotado comportamento fail-safe para `useReducedMotion()` indefinido (`null`): fallback estático por padrão;
  - fallback visual estático recebeu ajuste dedicado para dark mode para manter legibilidade/contraste sem animação;
  - metadados `data-motion-mode` e `data-scene-theme` adicionados no fallback para facilitar auditoria e regressão.

- `ThemeToggle`
  - ícones Sol/Lua atualizados com `motion-reduce:transition-none`, eliminando transições quando o usuário prefere menos movimento.

- Testes
  - criado `ThemeProvider.test.tsx` cobrindo aplicação inicial e reação a mudanças do sistema para tema e reduced-motion;
  - `HomeSceneBackdrop.test.tsx` e `GallerySceneBackdrop.test.tsx` ganharam caso para preferência de movimento indefinida, validando fallback estático.

## Resultado

- Preferências de acessibilidade passam a ser respeitadas de forma consistente, inclusive durante bootstrap/hidratação.
- Experiência visual preserva contraste em light/dark mesmo quando animações são desativadas.
- Contratos críticos ficam testáveis e rastreáveis para prevenir regressões futuras.
