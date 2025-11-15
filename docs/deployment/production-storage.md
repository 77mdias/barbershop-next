# 🌐 Sistema de Storage para Produção

## 📋 Visão Geral

O sistema de upload do Barbershop Next.js foi projetado para ser **modular** e **escalável**, suportando múltiplos providers de storage para diferentes necessidades de deployment.

### ✨ Características

- **🔄 Multi-Provider**: Local, AWS S3, Cloudinary, Google Cloud Storage, Azure
- **🛡️ Failover Automático**: Fallback entre providers
- **📊 Health Checks**: Monitoramento automático do storage
- **🚀 Production Ready**: Configurações específicas para produção
- **🔧 Easy Migration**: Scripts para migração entre providers

---

## 🏗️ Arquitetura

```
src/lib/upload/
├── config.ts                    # Configuração base e ambiente
├── storage.ts                   # Sistema atual (desenvolvimento)
├── storage-providers.ts         # Configurações de providers
├── storage-adapters.ts          # Implementações específicas
├── production-storage.ts        # Gerenciador para produção
├── processors.ts                # Processamento de imagens
├── validators.ts                # Validação de arquivos
└── rate-limiter.ts             # Rate limiting
```

### 🔌 Storage Adapters

Cada provider implementa a interface `StorageAdapter`:

```typescript
interface StorageAdapter {
  upload(file: Buffer, filename: string, folder: string): Promise<StorageResult>
  delete(url: string): Promise<boolean>
  getPublicUrl(filename: string, folder: string): string
  healthCheck(): Promise<boolean>
}
```

---

## 🚀 Setup para Produção

### 1. **Escolher Provider**

#### 🏆 **Cloudinary (Recomendado)**
- ✅ Otimização automática de imagens
- ✅ CDN global integrado
- ✅ Transformações on-the-fly
- ✅ Free tier generoso
- ❌ Mais caro em volumes altos

```bash
./scripts/setup-storage.sh cloudinary
```

#### 💰 **AWS S3 + CloudFront**
- ✅ Mais barato em escala
- ✅ Controle total da infraestrutura
- ✅ Integração com outros serviços AWS
- ❌ Requer mais configuração
- ❌ Não processa imagens automaticamente

```bash
./scripts/setup-storage.sh s3
```

#### 🔒 **Google Cloud Storage**
- ✅ Boa integração com GCP
- ✅ Preços competitivos
- ✅ Performance global
- ❌ Menos recursos de imagem

```bash
./scripts/setup-storage.sh gcs
```

#### 🔷 **Azure Blob Storage**
- ✅ Integração com Azure
- ✅ Preços competitivos
- ✅ Compliance enterprise
- ❌ Menos recursos de imagem

```bash
./scripts/setup-storage.sh azure
```

### 2. **Configurar Variáveis de Ambiente**

Copie o exemplo para seu arquivo de produção:

```bash
cp .env.storage.example .env.production
```

#### Exemplo Cloudinary:
```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=barbershop-app
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_key_here
CLOUDINARY_UPLOAD_PRESET=barbershop-uploads
```

#### Exemplo AWS S3:
```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=barbershop-uploads
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_CLOUDFRONT_URL=https://d123.cloudfront.net
```

### 3. **Instalar Dependências**

O script de setup instala automaticamente as dependências necessárias:

```bash
# Para Cloudinary
docker compose exec app npm install cloudinary

# Para AWS S3
docker compose exec app npm install @aws-sdk/client-s3

# Para Google Cloud
docker compose exec app npm install @google-cloud/storage

# Para Azure
docker compose exec app npm install @azure/storage-blob
```

### 4. **Testar Configuração**

```bash
./scripts/setup-storage.sh test
```

---

## 🔧 Uso no Código

### **Desenvolvimento (Atual)**

O sistema atual continua funcionando normalmente:

```typescript
import { storage } from '@/lib/upload/storage'

// Upload local
const result = await storage.save(buffer, 'profile.jpg', {
  folder: 'profiles'
})
```

### **Produção (Novo)**

Para produção, use o gerenciador avançado:

```typescript
import { productionStorage } from '@/lib/upload/production-storage'

// Upload com múltiplos providers e retry
const result = await productionStorage.uploadFile(
  buffer, 
  'profile.jpg', 
  'profiles',
  {
    userId: user.id,
    useMultiProvider: true,
    retries: 2
  }
)

if (result.success) {
  console.log('Upload realizado:', result.publicUrl)
  console.log('Provider usado:', result.provider)
} else {
  console.error('Erro no upload:', result.error)
}
```

### **Server Actions**

Atualização mínima necessária:

```typescript
// src/server/uploadActions.ts
import { productionStorage } from '@/lib/upload/production-storage'

export async function uploadProfileImage(formData: FormData) {
  // ... validações existentes ...
  
  // Usar produção se disponível, senão manter atual
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    const result = await productionStorage.uploadFile(
      buffer,
      file.name,
      'profiles',
      { userId: session.user.id }
    )
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return {
      success: true,
      url: result.publicUrl,
      provider: result.provider
    }
  } else {
    // Usar sistema atual para desenvolvimento
    const result = await storage.save(buffer, file.name, { folder: 'profiles' })
    return {
      success: true,
      url: result.url,
      provider: 'local'
    }
  }
}
```

---

## 📊 Monitoramento

### **Health Check**

```typescript
import { productionStorage } from '@/lib/upload/production-storage'

const status = await productionStorage.getStatus()

console.log({
  provider: status.provider,
  isHealthy: status.isHealthy,
  environment: status.environment
})
```

### **Endpoint de Status**

Crie um endpoint para monitoramento:

```typescript
// src/app/api/health/storage/route.ts
import { productionStorage } from '@/lib/upload/production-storage'

export async function GET() {
  const status = await productionStorage.getStatus()
  
  return Response.json(status, {
    status: status.isHealthy ? 200 : 503
  })
}
```

---

## 🔄 Migração

### **Entre Ambientes**

Para migrar de desenvolvimento para produção:

1. **Configure o novo provider**
2. **Teste a configuração**
3. **Faça deploy**
4. **Migre arquivos existentes** (se necessário)

### **Script de Migração**

```bash
# Migrar arquivos do local para S3
./scripts/migrate-storage.sh local s3 profiles/
```

### **Migração no Código**

```typescript
import { productionStorage } from '@/lib/upload/production-storage'

// Migrar lista de URLs
const fileUrls = [
  '/uploads/profiles/user1-123.jpg',
  '/uploads/reviews/review1-456.jpg'
]

const result = await productionStorage.migrateFiles(
  's3',
  'profiles',
  fileUrls
)

console.log(`Migração: ${result.success} sucessos, ${result.failed} falhas`)
```

---

## 💡 Recomendações

### **Para Startups/MVPs**
1. **Comece com Cloudinary** - Setup rápido e otimização automática
2. **Use o free tier** - 25GB de storage e 25GB de bandwidth
3. **Configure transformações** - Diferentes tamanhos automaticamente

### **Para Escala**
1. **Migre para AWS S3** - Custos menores em volume
2. **Configure CloudFront** - CDN para performance global
3. **Implemente caching** - Reduzir requests ao storage

### **Para Enterprise**
1. **Use multi-provider** - Redundância e failover
2. **Configure monitoring** - Health checks e alertas
3. **Implemente backup** - Estratégia de disaster recovery

---

## 🚨 Troubleshooting

### **Problemas Comuns**

#### ❌ **"Storage provider not configured"**
```bash
# Verifique variáveis de ambiente
./scripts/setup-storage.sh test

# Configure o provider
./scripts/setup-storage.sh cloudinary
```

#### ❌ **"Upload failed after retries"**
```bash
# Verifique conectividade
curl -I https://api.cloudinary.com/v1_1/your_cloud/image/upload

# Verifique credenciais
./scripts/setup-storage.sh test
```

#### ❌ **"Health check failed"**
```bash
# Verifique status do provider
./scripts/setup-storage.sh test

# Verifique logs
docker compose logs app | grep storage
```

### **Debug Mode**

```env
# Ativar logs detalhados
DEBUG=storage:*
LOG_LEVEL=debug
```

---

## 📈 Performance

### **Métricas**

- **Upload Time**: < 2s para imagens < 5MB
- **CDN Response**: < 100ms globally
- **Availability**: 99.9% uptime
- **Bandwidth**: Unlimited (com CDN)

### **Otimizações**

1. **Image Processing**: Automático com Cloudinary
2. **Compression**: WebP format quando possível
3. **Caching**: CDN headers configurados
4. **Lazy Loading**: Implementado no frontend

---

## 🔒 Segurança

### **Validações**

- ✅ Tipo de arquivo (MIME type)
- ✅ Tamanho máximo (5MB por arquivo)
- ✅ Rate limiting (10 uploads/15min/usuário)
- ✅ Sanitização de nomes de arquivo
- ✅ Verificação de autenticação

### **Permissões**

- ✅ Uploads públicos somente leitura
- ✅ Upload limitado a usuários autenticados
- ✅ Folders organizados por tipo
- ✅ URLs não-previsíveis

---

## 📚 Referências

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/s3/latest/userguide/best-practices.html)
- [Google Cloud Storage Guide](https://cloud.google.com/storage/docs)
- [Azure Blob Storage Docs](https://docs.microsoft.com/azure/storage/blobs/)

---

## 🆕 Próximas Versões

- [ ] Suporte a video uploads
- [ ] Batch upload optimization
- [ ] Advanced image transformations
- [ ] Backup strategies
- [ ] Cost optimization tools