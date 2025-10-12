# Sistema de Upload de Imagens para Avaliações

## Visão Geral

Sistema completo e seguro para upload de imagens em avaliações de serviços, implementado com Next.js 14, TypeScript e Sharp para processamento de imagens.

## Funcionalidades

### ✅ Segurança
- **Validação de tipo de arquivo**: Apenas JPEG, PNG e WebP
- **Verificação de assinatura**: Magic numbers para validar arquivos reais
- **Rate limiting**: Máximo 10 uploads por hora por IP
- **Autenticação obrigatória**: NextAuth.js integration
- **Sanitização de nomes**: Remove caracteres especiais
- **Validação de dimensões**: Mínimo 100x100, máximo 4000x4000 pixels

### ✅ Performance e Otimização
- **Processamento com Sharp**: Redimensionamento e compressão automática
- **Detecção de duplicatas**: Hash SHA-256 para evitar arquivos duplicados
- **Lazy loading**: Preview em tempo real
- **Compressão inteligente**: JPEG progressivo com qualidade 85%

### ✅ UX/UI
- **Drag & Drop**: Interface intuitiva para upload
- **Preview instantâneo**: Visualização antes do upload
- **Feedback visual**: Estados de loading, erro e sucesso
- **Múltiplos arquivos**: Até 5 imagens por vez
- **Responsivo**: Design mobile-first

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── upload.ts              # Configuração principal de upload
│   └── rate-limit.ts          # Rate limiting por IP
├── components/
│   ├── ui/
│   │   └── ImageUpload.tsx    # Componente de upload
│   └── ReviewForm.tsx         # Formulário de avaliação
├── app/
│   ├── api/upload/images/
│   │   └── route.ts           # API endpoint para upload
│   └── test-upload/
│       └── page.tsx           # Página de teste
└── public/uploads/reviews/    # Diretório de imagens
```

## Schema do Banco

```prisma
model ServiceHistory {
  id           String        @id @default(cuid())
  // ... outros campos
  images       String[]      @default([]) // URLs das imagens
  // ... outros campos
}
```

## Uso Básico

### 1. Componente ImageUpload

```tsx
import { ImageUpload } from '@/components/ui/ImageUpload';

function MyForm() {
  const handleUpload = (urls: string[]) => {
    console.log('Imagens enviadas:', urls);
  };

  return (
    <ImageUpload
      onUpload={handleUpload}
      maxFiles={5}
      maxSize={5}
      disabled={false}
    />
  );
}
```

### 2. Formulário Completo

```tsx
import { ReviewForm } from '@/components/ReviewForm';

function ReviewPage() {
  return (
    <ReviewForm
      serviceHistoryId="service-123"
      onSubmit={(data) => console.log(data)}
    />
  );
}
```

### 3. API Usage

```typescript
// Upload de imagens
const formData = new FormData();
files.forEach(file => formData.append('files', file));

const response = await fetch('/api/upload/images', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

## Configurações

### Limites e Validações

```typescript
// src/lib/upload.ts
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
```

### Rate Limiting

```typescript
// src/lib/rate-limit.ts
const RATE_LIMIT = {
  maxAttempts: 10,           // 10 uploads por hora
  windowMs: 60 * 60 * 1000,  // 1 hora
  blockDurationMs: 15 * 60 * 1000 // bloqueio 15 min
};
```

### Processamento de Imagem

```typescript
await sharp(buffer)
  .resize(1200, 900, {
    fit: 'inside',
    withoutEnlargement: true
  })
  .jpeg({ 
    quality: 85,
    progressive: true
  })
  .toFile(filePath);
```

## Testes

### Página de Teste
Acesse `/test-upload` para testar o sistema completo.

### Validações a Testar
- [ ] Upload de arquivo muito grande (>5MB)
- [ ] Upload de tipo não permitido (.gif, .txt)
- [ ] Upload sem autenticação
- [ ] Rate limiting (>10 uploads/hora)
- [ ] Drag & drop funcional
- [ ] Preview de imagens
- [ ] Remoção de arquivos

## Segurança

### Magic Numbers Verificados
```typescript
const FILE_SIGNATURES = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/webp': ['52494646']
};
```

### Sanitização
- Remoção de caracteres especiais
- Validação de nome do arquivo
- Hash único para evitar conflitos

### Autenticação
- NextAuth.js session obrigatória
- Verificação em cada upload
- Headers de autorização

## Deploy e Produção

### Variáveis de Ambiente
```bash
# Não são necessárias variáveis específicas
# O sistema usa storage local em /public/uploads/
```

### Nginx (se necessário)
```nginx
client_max_body_size 10M;  # Para uploads até 10MB
```

### Docker
O sistema funciona perfeitamente no container Docker configurado.

## Próximos Passos

### Melhorias Futuras
- [ ] Storage em cloud (AWS S3, Cloudinary)
- [ ] Watermark automático
- [ ] Compressão WebP
- [ ] CDN integration
- [ ] Thumbnails automáticos
- [ ] Metadados EXIF

### Monitoramento
- [ ] Logs de upload
- [ ] Métricas de uso
- [ ] Alertas de erro
- [ ] Dashboard de uploads

## Troubleshooting

### Erro: "Module not found"
```bash
docker compose exec app npm install sharp multer @types/multer
```

### Erro: Permissões de arquivo
```bash
# Verificar permissões do diretório uploads
ls -la public/uploads/
```

### Erro: Rate limit muito restritivo
Ajustar configurações em `src/lib/rate-limit.ts`.

---

**Status**: ✅ Implementação completa e funcional
**Última atualização**: 12 de outubro de 2025