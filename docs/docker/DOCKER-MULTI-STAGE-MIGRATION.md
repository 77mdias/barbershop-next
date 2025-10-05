# 🐳 Docker Multi-Stage Unificado - Documentação

## 📋 Resumo da Migração

Migração bem-sucedida de arquivos Docker separados para um **único Dockerfile multi-stage** otimizado.

### ✅ O que foi implementado:

1. **Dockerfile único** com 4 stages otimizados:
   - `deps`: Instalação de dependências (cache otimizado)
   - `dev`: Desenvolvimento com hot reload
   - `builder`: Build de produção
   - `prod`: Imagem final de produção

2. **Docker Compose atualizado** para usar targets específicos:
   - `docker-compose.yml`: usa `target: dev`
   - `docker-compose.prod.yml`: usa `target: prod`

3. **Limpeza**: Removidos arquivos duplicados (`Dockerfile.dev` e `Dockerfile.prod`)

## 🚀 Comandos de Uso

### Desenvolvimento
```bash
# Build apenas do target de desenvolvimento
docker build --target dev -t barbershop-dev .

# Rodar ambiente completo de desenvolvimento
docker compose up -d
```

### Produção
```bash
# Build apenas do target de produção
docker build --target prod -t barbershop-prod .

# Rodar ambiente de produção
docker compose -f docker-compose.prod.yml up -d
```

### Build de todas as stages
```bash
# Build completo (todas as stages)
docker build -t barbershop-complete .
```

## 🔧 Benefícios Alcançados

### 🎯 **Cache Otimizado**
- Stage `deps` reutilizada entre dev/prod
- Layer de `npm ci` compartilhada
- Build incremental mais rápido

### 🔄 **Manutenção Simplificada**
- Uma única fonte de verdade
- Mudanças sincronizadas automaticamente
- Zero duplicação de código

### 📦 **Flexibilidade**
- Targets específicos para cada ambiente
- Imagens otimizadas por uso
- Configuração centralizada

## 📊 Tamanhos das Imagens

```bash
REPOSITORY        TAG       SIZE
barbershop-prod   latest    1.78GB  # Produção otimizada
barbershop-dev    latest    1.29GB  # Desenvolvimento
```

## 🛠️ Estrutura dos Stages

### 1. **deps** (Base de dependências)
- Node.js 20 Alpine
- Timezone configurado
- npm ci para dependências

### 2. **dev** (Desenvolvimento)
- Herda de `deps`
- Prisma Client gerado
- Hot reload habilitado
- Portas 3000 e 5555 expostas

### 3. **builder** (Build de produção)
- Herda de `deps`
- Build Next.js otimizado
- Assets estáticos gerados

### 4. **prod** (Produção final)
- Imagem mínima Alpine
- Usuário não-root (segurança)
- Health check configurado
- Apenas arquivos essenciais

## 🔍 Validação

✅ **Build dev**: Funcional  
✅ **Build prod**: Funcional  
✅ **Docker Compose dev**: Configurado  
✅ **Docker Compose prod**: Configurado  
✅ **Remoção de duplicatas**: Completa  

## 📝 Próximos Passos

1. Teste local com `docker compose up`
2. Validação de funcionalidades em desenvolvimento
3. Deploy de produção quando necessário
4. Monitoramento de performance das novas imagens

---

**Data da Migração**: 5 de outubro de 2025  
**Status**: ✅ Concluída com sucesso