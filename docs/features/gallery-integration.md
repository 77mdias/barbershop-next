# 🎨 Exemplo de Integração da Galeria na Página Principal

## Como adicionar a galeria compacta na home

Para adicionar uma seção de galeria na página principal, você pode usar o componente `CortesGalleryCompact`:

```tsx
// src/app/page.tsx

import { CortesGalleryCompact } from "@/components/cortes-gallery";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Suas seções existentes */}
      <main className="flex-1 pt-20">
        {/* Seção de serviços */}
        <section>
          {/* ... código existente ... */}
        </section>

        {/* Seção de ofertas */}
        <section>
          {/* ... código existente ... */}
        </section>

        {/* 🆕 NOVA SEÇÃO: Galeria de Cortes */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Nossos Trabalhos
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Veja alguns dos cortes e estilos que já realizamos. 
                Cada cliente recebe um atendimento personalizado.
              </p>
            </div>
            
            <CortesGalleryCompact />
            
            {/* Link para ver todos */}
            <div className="text-center mt-8">
              <Link 
                href="/galeria" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Ver Todos os Trabalhos
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Seção de salões próximos */}
        <section>
          {/* ... código existente ... */}
        </section>
      </main>
    </div>
  );
}
```

## Variações de Layout

### 1. Galeria em Cards (Horizontal)
```tsx
<div className="overflow-x-auto pb-4">
  <div className="flex gap-4 w-max">
    {/* Renderizar apenas 4-5 imagens em formato card horizontal */}
  </div>
</div>
```

### 2. Galeria com Depoimentos
```tsx
<section className="py-16">
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h2>Nossos Trabalhos</h2>
      <p>Descrição...</p>
      
      {/* Depoimentos */}
      <div className="mt-8">
        <blockquote className="italic text-gray-600">
          "Excelente trabalho! Super recomendo."
        </blockquote>
        <cite className="text-sm text-gray-500">- João Silva</cite>
      </div>
    </div>
    
    <div>
      <CortesGalleryCompact />
    </div>
  </div>
</section>
```

### 3. Galeria com Estatísticas
```tsx
<section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
  <div className="max-w-7xl mx-auto px-4">
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      <div className="text-center">
        <div className="text-4xl font-bold">500+</div>
        <div className="text-primary-200">Cortes Realizados</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold">98%</div>
        <div className="text-primary-200">Clientes Satisfeitos</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold">5★</div>
        <div className="text-primary-200">Avaliação Média</div>
      </div>
    </div>
    
    <CortesGalleryCompact />
  </div>
</section>
```

## Personalização de Cores

Para personalizar as cores da galeria, você pode usar CSS customizado:

```css
/* src/app/globals.css */

.gallery-custom {
  --gallery-bg: #f8fafc;
  --gallery-hover: #e2e8f0;
  --gallery-overlay: rgba(0, 0, 0, 0.4);
}

.gallery-custom .group:hover {
  background-color: var(--gallery-hover);
}

.gallery-custom .group:hover .overlay {
  background-color: var(--gallery-overlay);
}
```

E aplicar a classe:

```tsx
<CortesGalleryCompact className="gallery-custom" />
```