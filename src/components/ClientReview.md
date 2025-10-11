# Componente ClientReview

Um componente React para exibir avaliações e depoimentos de clientes em formato de carrossel, seguindo a arquitetura **mobile-first** e baseado no design do Figma.

## Características

- **Design mobile-first** com layouts específicos para mobile e desktop
- **Totalmente responsivo** seguindo breakpoints do Tailwind CSS
- **Navegação por carrossel** com setas e indicadores
- **Imagens sobrepostas** com bordas tracejadas vermelhas
- **Dados mockados** prontos para uso
- **TypeScript** com interfaces bem definidas
- **Acessibilidade** com labels apropriados

## Breakpoints e Layouts

### Mobile (< 1024px)
- Layout vertical em coluna
- Imagem principal quadrada responsiva
- Texto centralizado
- Controles de navegação compactos
- Indicadores menores

### Desktop (≥ 1024px)
- Layout horizontal com setas laterais
- Imagem fixa de 480x480px
- Texto alinhado à esquerda
- Controles de navegação maiores
- Indicadores padrão

## Uso Básico

```tsx
import { ClientReview } from "@/components/ClientReview";

export default function MyPage() {
  return (
    <div>
      <ClientReview />
    </div>
  );
}
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-----------|
| `reviews` | `ClientReviewData[]` | `mockReviews` | Array de avaliações para exibir |
| `className` | `string` | `undefined` | Classes CSS adicionais |

## Interface ClientReviewData

```typescript
interface ClientReviewData {
  id: string;
  mainImage: string;        // URL da imagem principal
  overlayImage: string;     // URL da imagem sobreposta
  testimonial: string;      // Texto do depoimento
  clientName: string;       // Nome do cliente
  clientTitle: string;      // Cargo do cliente
  clientCompany: string;    // Empresa do cliente
  rating?: number;          // Avaliação em estrelas (futuro)
  serviceDate?: string;     // Data do serviço (futuro)
  serviceType?: string;     // Tipo de serviço (futuro)
}
```

## Dados Mockados

O componente vem com dados de exemplo incluindo:
- 3 avaliações diferentes
- Imagens placeholder
- Depoimentos variados
- Informações de clientes fictícios

## Funcionalidades

### Layout Mobile-First
- **Mobile**: Layout vertical com imagem quadrada responsiva (max-width: 320px)
- **Tablet**: Adaptações de tamanho e espaçamento  
- **Desktop**: Layout horizontal original do Figma (480x480px)
- **XL**: Espaçamentos e tipografia otimizados

### Navegação
- **Setas laterais**: Navegar para avaliação anterior/próxima
- **Indicadores**: Círculos clicáveis para navegação direta
- **Touch-friendly**: Botões maiores em dispositivos móveis
- **Responsive images**: Fallback automático para imagens quebradas

### Responsividade
- **Padding**: `py-8 px-4` (mobile) → `py-16` (md) → `py-20 px-20` (lg)
- **Tipografia**: `text-lg` (mobile) → `text-xl` (lg) → `text-2xl` (xl)
- **Imagens**: aspect-square responsivo → tamanhos fixos no desktop
- **Espaçamentos**: gaps adaptativos por breakpoint

## Estrutura de Arquivos

```
src/
├── components/
│   └── ClientReview.tsx          # Componente principal
├── types/
│   └── client-review.ts          # Interfaces TypeScript
└── app/
    └── client-review-demo/
        └── page.tsx              # Página de demonstração
```

## Desenvolvimento Futuro

### Funcionalidades Planejadas
- [ ] Sistema de estrelas para avaliação
- [ ] Rotação automática do carrossel
- [ ] Integração com banco de dados
- [ ] Filtros por tipo de serviço
- [ ] Animações de transição
- [ ] Suporte para vídeos depoimentos
- [ ] Compartilhamento em redes sociais

### Melhorias Técnicas
- [ ] Lazy loading das imagens
- [ ] Otimização de performance
- [ ] Testes unitários
- [ ] Storybook stories
- [ ] Documentação de acessibilidade

## Exemplo de Uso Personalizado

```tsx
import { ClientReview } from "@/components/ClientReview";
import { ClientReviewData } from "@/types/client-review";

const customReviews: ClientReviewData[] = [
  {
    id: "custom-1",
    mainImage: "/images/my-image.jpg",
    overlayImage: "/images/my-overlay.jpg",
    testimonial: "Meu depoimento personalizado...",
    clientName: "João Silva",
    clientTitle: "CEO",
    clientCompany: "Minha Empresa"
  }
];

export default function CustomPage() {
  return (
    <ClientReview 
      reviews={customReviews}
      className="my-custom-styles"
    />
  );
}
```

## Dependências

- `react`: Hook useState para gerenciamento de estado
- `lucide-react`: Ícones de navegação (ChevronLeft, ChevronRight)
- `@/components/ui/button`: Botão do shadcn/ui
- `@/lib/utils`: Utilitário cn para classes CSS

## Demonstração

Visite `/client-review-demo` para ver o componente em ação com todos os recursos funcionando.