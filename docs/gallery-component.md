                                                                                                          # 📸 Componente de Galeria - Barbershop

## 🎯 Visão Geral

Componente moderno e responsivo de galeria de imagens criado especificamente para a barbershop. Inclui lightbox integrado, navegação por teclado, e otimização para mobile.

## 🚀 Características

- ✅ **Responsive**: Adaptável a todos os tamanhos de tela
- ✅ **Lightbox**: Modal para visualização ampliada das imagens
- ✅ **Navegação por Teclado**: Setas e ESC para navegar
- ✅ **Loading States**: Skeleton loading para melhor UX
- ✅ **Otimizado**: Usa Next.js Image para performance
- ✅ **Acessível**: Componente acessível e semântico
- ✅ **TypeScript**: Totalmente tipado

## 📋 Como Usar

### Uso Básico

```tsx
import { Gallery, type GalleryImage } from "@/components/gallery";

const images: GalleryImage[] = [
  {
    src: "/images/cortes/corte1.jpg",
    alt: "Corte Americano",
    title: "Corte Americano Clássico"
  },
  // ... mais imagens
];

export function MinhaGaleria() {
  return (
    <Gallery
      images={images}
      title="Nossos Trabalhos"
      subtitle="Confira alguns dos cortes realizados"
      columns={3}
    />
  );
}
```

### Componentes Prontos

O projeto já inclui componentes prontos para usar:

#### 1. **CortesGallerySection** - Galeria Completa
```tsx
import { CortesGallerySection } from "@/components/cortes-gallery";

export function MinhaPageina() {
  return <CortesGallerySection />;
}
```

#### 2. **CortesGalleryCompact** - Versão Compacta
```tsx
import { CortesGalleryCompact } from "@/components/cortes-gallery";

export function SecaoCortes() {
  return <CortesGalleryCompact />;
}
```

#### 3. **CortesGalleryCarousel** - Para Mobile
```tsx
import { CortesGalleryCarousel } from "@/components/cortes-gallery";

export function GaleriaMobile() {
  return <CortesGalleryCarousel />;
}
```

## ⚙️ Props do Componente Gallery

### GalleryProps

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `images` | `GalleryImage[]` | **obrigatório** | Array de imagens para exibir |
| `title` | `string` | `undefined` | Título da galeria |
| `subtitle` | `string` | `undefined` | Subtítulo da galeria |
| `columns` | `1 \| 2 \| 3 \| 4` | `3` | Número de colunas na grid |
| `className` | `string` | `undefined` | Classes CSS adicionais |
| `showZoomOverlay` | `boolean` | `true` | Se deve mostrar overlay com zoom ao hover |

### GalleryImage

| Prop | Tipo | Descrição |
|------|------|-----------|
| `src` | `string` | Caminho da imagem |
| `alt` | `string` | Texto alternativo da imagem |
| `title` | `string` | Título da imagem (opcional) |

## 🎨 Estilos e Customização

### Classes CSS Disponíveis

O componente usa Tailwind CSS e pode ser customizado através das seguintes abordagens:

#### 1. Usando a prop `className`
```tsx
<Gallery
  images={images}
  className="my-custom-gallery bg-gray-50 p-8"
/>
```

#### 2. Sobrescrever estilos específicos
```css
/* Em seu arquivo CSS global ou módulo */
.gallery-custom .group:hover {
  transform: scale(1.02);
}
```

### Breakpoints Responsivos

- **Mobile**: `grid-cols-1`
- **Tablet**: `sm:grid-cols-2`
- **Desktop**: `lg:grid-cols-3` (ou 4 se columns=4)
- **Large**: `xl:grid-cols-4` (apenas se columns=4)

## 🎯 Casos de Uso

### 1. Página Principal
```tsx
// src/app/page.tsx
import { CortesGalleryCompact } from "@/components/cortes-gallery";

export default function Home() {
  return (
    <div>
      {/* Outras seções */}
      <CortesGalleryCompact />
    </div>
  );
}
```

### 2. Página Dedicada de Galeria
```tsx
// src/app/galeria/page.tsx
import { CortesGallerySection } from "@/components/cortes-gallery";

export default function GalleryPage() {
  return <CortesGallerySection />;
}
```

### 3. Seção em About/Serviços
```tsx
// src/app/sobre/page.tsx
import { Gallery } from "@/components/gallery";

const featuredWorks: GalleryImage[] = [
  // 3-4 melhores trabalhos
];

export default function About() {
  return (
    <div>
      <section>
        <h2>Nosso Trabalho</h2>
        <Gallery images={featuredWorks} columns={2} />
      </section>
    </div>
  );
}
```

## 🔧 Funcionalidades Avançadas

### Navegação por Teclado
- **ESC**: Fecha o lightbox
- **← Seta Esquerda**: Imagem anterior
- **→ Seta Direita**: Próxima imagem

### Estados de Loading
O componente automaticamente mostra um skeleton loader enquanto as imagens carregam.

### Otimização de Performance
- Usa `Next.js Image` com lazy loading
- Sizes responsivos para diferentes breakpoints
- Quality otimizada (85 para grid, 95 para lightbox)

## 🌟 Melhorias Futuras

Funcionalidades que podem ser adicionadas:

1. **Filtros por Categoria**
```tsx
const categories = ["Americano", "Clássico", "Moderno"];
// Implementar filtro por tipo de corte
```

2. **Busca por Texto**
```tsx
// Buscar por título ou alt text
const filteredImages = images.filter(img => 
  img.title?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

3. **Favoritos**
```tsx
// Marcar imagens como favoritas
const [favorites, setFavorites] = useState<string[]>([]);
```

4. **Compartilhamento Social**
```tsx
// Botões para compartilhar imagens específicas
const shareImage = (imageUrl: string) => {
  // Implementar compartilhamento
};
```

## 🚀 Deploy e Performance

### Otimização de Imagens
1. **Formato**: Prefira WebP para imagens modernas
2. **Tamanho**: Redimensione imagens para max 1200px de largura
3. **Compressão**: Use ferramentas como TinyPNG

### CDN (Recomendado)
Para melhor performance, considere usar um CDN:

```tsx
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.suabarbearia.com'],
  },
};
```

---

## 📞 Suporte

Se tiver dúvidas sobre o componente ou precisar de customizações específicas, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.