# PH6-MSI-004 - Log Tecnico

## Resumo

Implementada validação de direção/intenção de movimento para Home e Gallery, priorizando propósito de UX (descoberta, foco e CTA) e redução de ruído visual.

## Alterações principais

- `HomeExperience`:
  - adicionados metadados de intenção por ato (`data-ux-intent-primary`) junto ao contrato `data-storyboard-*`;
  - adicionados atributos de propósito em cada camada scroll-depth (`data-ux-intent`, `data-ux-purpose`);
  - microinteração dos cards de serviço ajustada para deslocamento planar (`x` + `y`), removendo rotação 3D decorativa.

- `GalleryExperience`:
  - criado storyboard de 3 atos (hero, coleções, portfólio) com contrato narrativo completo em `data-storyboard-*`;
  - adicionada intenção primária por seção (`data-ux-intent-primary`);
  - adicionados atributos de propósito em camadas scroll-depth (`data-ux-intent`, `data-ux-purpose`).

- Testes:
  - `Home3DExperience.test.tsx` e `GalleryExperience.test.tsx` atualizados para validar o contrato de intenção/storyboard e propósito nas camadas principais.

## Resultado

- Cada animação principal passou a ter propósito funcional explícito e rastreável no DOM.
- Foi reduzida a chance de animações decorativas comprometerem leitura na Home.
- Fallback de movimento reduzido permaneceu ativo sem regressão.
