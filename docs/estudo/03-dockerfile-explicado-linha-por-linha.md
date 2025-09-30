# 📚 Estudo 03 - Dockerfile Explicado Linha por Linha

## 🎯 O que é um Dockerfile?

Um **Dockerfile** é um arquivo de texto com instruções para criar uma **imagem Docker**. É como uma "receita" que diz ao Docker:
- Qual sistema operacional usar
- Quais programas instalar
- Como configurar a aplicação
- Como executar a aplicação

---

## 🏗️ Conceito: Multi-Stage Build

Nosso Dockerfile usa **Multi-Stage Build** - uma técnica avançada que cria múltiplas "etapas" na construção da imagem:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DEPS      │───▶│    DEV      │    │   BUILDER   │───▶│    PROD     │
│ (instalar)  │    │(desenvolvimento)│    │  (compilar) │    │ (executar)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### ✅ Vantagens do Multi-Stage:
- **Imagens menores**: Produção só tem o necessário
- **Segurança**: Não expõe código-fonte em produção
- **Flexibilidade**: Diferentes configurações para dev/prod
- **Eficiência**: Reutiliza camadas entre estágios

---

## 📝 Análise Linha por Linha

### 🔧 **ESTÁGIO 1: DEPS (Dependências)**

```dockerfile
# Estágio de dependências - usado como base para dev e prod
FROM node:20-alpine AS deps
```
**O que faz:**
- `FROM node:20-alpine`: Usa imagem base do Node.js versão 20 com Alpine Linux
- `AS deps`: Nomeia este estágio como "deps" para referenciar depois
- **Alpine Linux**: Distribuição muito leve (~5MB vs ~100MB do Ubuntu)

```dockerfile
WORKDIR /app
```
**O que faz:**
- Define `/app` como diretório de trabalho dentro do container
- Todos os comandos seguintes serão executados nesta pasta

```dockerfile
COPY package*.json ./
```
**O que faz:**
- Copia `package.json` e `package-lock.json` do host para o container
- `*` é um wildcard que pega ambos os arquivos
- Copiamos apenas estes arquivos primeiro para aproveitar o **cache do Docker**

```dockerfile
RUN npm install && npm install autoprefixer postcss tailwindcss tailwindcss-animate --save-dev && npm cache clean --force
```
**O que faz:**
1. `npm install`: Instala dependências do `package.json`
2. `npm install autoprefixer...`: Instala dependências específicas do Tailwind
3. `npm cache clean --force`: Limpa cache para reduzir tamanho da imagem

**💡 Por que separar em duas linhas?**
- Garantir que dependências específicas estejam instaladas
- Algumas vezes o `package.json` pode não ter todas as dependências dev

---

### 🛠️ **ESTÁGIO 2: DEV (Desenvolvimento)**

```dockerfile
FROM node:20-alpine AS dev
WORKDIR /app
```
**O que faz:**
- Cria novo estágio baseado no Node.js Alpine
- Define diretório de trabalho

```dockerfile
COPY --from=deps /app/node_modules ./node_modules
```
**O que faz:**
- Copia pasta `node_modules` do estágio "deps"
- **Vantagem**: Não precisa instalar dependências novamente

```dockerfile
COPY . .
```
**O que faz:**
- Copia **todo o código** do projeto para o container
- Inclui `src/`, `prisma/`, `public/`, etc.

```dockerfile
RUN npm install autoprefixer postcss tailwindcss tailwindcss-animate --save-dev
```
**O que faz:**
- Garante que dependências do Tailwind estejam instaladas
- **Redundância intencional** para evitar problemas

```dockerfile
RUN npx prisma generate
```
**O que faz:**
- **CRUCIAL**: Gera o Prisma Client dentro do container
- Cria arquivos TypeScript em `src/generated/prisma/`
- **Sem isso**: Aplicação não consegue conectar com banco

```dockerfile
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV NEXT_TELEMETRY_DISABLED=1
```
**O que faz:**
- `WATCHPACK_POLLING`: Habilita polling para detectar mudanças de arquivo
- `CHOKIDAR_USEPOLLING`: Melhora hot-reload no Docker
- `NEXT_TELEMETRY_DISABLED`: Desabilita telemetria do Next.js

**💡 Por que essas variáveis?**
- Docker tem dificuldade para detectar mudanças de arquivo
- Polling força verificação periódica
- Melhora experiência de desenvolvimento

```dockerfile
EXPOSE 3000
CMD ["npm", "run", "dev"]
```
**O que faz:**
- `EXPOSE 3000`: Informa que container usa porta 3000
- `CMD ["npm", "run", "dev"]`: Comando padrão para iniciar aplicação

---

### 🏗️ **ESTÁGIO 3: BUILDER (Compilação)**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
```
**O que faz:**
- Novo estágio para compilar aplicação
- Reutiliza `node_modules` do estágio "deps"
- Copia todo o código

```dockerfile
RUN npx prisma generate
RUN npm run build
```
**O que faz:**
1. `npx prisma generate`: Gera Prisma Client (necessário para build)
2. `npm run build`: Compila aplicação Next.js para produção

**💡 Por que gerar Prisma novamente?**
- Cada estágio é independente
- Build precisa do Prisma Client para compilar código TypeScript

---

### 🚀 **ESTÁGIO 4: PROD (Produção)**

```dockerfile
FROM node:20-alpine AS prod
WORKDIR /app
```
**O que faz:**
- Estágio final para produção
- Imagem limpa, apenas com o necessário

```dockerfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
```
**O que faz:**
- Copia apenas arquivos necessários para produção:
  - `.next/`: Aplicação compilada
  - `public/`: Arquivos estáticos
  - `node_modules/`: Dependências
  - `package.json`: Metadados
  - `next.config.ts`: Configuração do Next.js

**💡 O que NÃO é copiado:**
- `src/`: Código-fonte (não precisa em produção)
- `prisma/`: Schemas (já compilados)
- `.env`: Variáveis de ambiente (passadas externamente)

```dockerfile
EXPOSE 3000
CMD ["npm", "start"]
```
**O que faz:**
- Expõe porta 3000
- Executa aplicação compilada com `npm start`

---

## 🎯 Fluxo de Execução

### 🛠️ **Para Desenvolvimento:**
```bash
docker build --target dev -t barbershop-dev .
docker run -p 3000:3000 barbershop-dev
```

### 🚀 **Para Produção:**
```bash
docker build --target prod -t barbershop-prod .
docker run -p 3000:3000 barbershop-prod
```

### 🔄 **Com Docker Compose:**
```bash
docker-compose up app  # Usa estágio 'dev' automaticamente
```

---

## 🔍 Otimizações Implementadas

### 1. **Cache de Dependências**
```dockerfile
# ✅ Correto: Copia package.json primeiro
COPY package*.json ./
RUN npm install

# ❌ Errado: Copia tudo e depois instala
COPY . .
RUN npm install
```

### 2. **Imagem Base Leve**
```dockerfile
# ✅ Alpine: ~5MB
FROM node:20-alpine

# ❌ Ubuntu: ~100MB
FROM node:20
```

### 3. **Limpeza de Cache**
```dockerfile
RUN npm install && npm cache clean --force
```

### 4. **Multi-Stage para Produção Limpa**
- Produção não tem código-fonte
- Apenas arquivos compilados
- Imagem final menor e mais segura

---

## 🐛 Problemas Resolvidos

### 1. **Prisma Client não encontrado**
**Problema:**
```
@prisma/client did not initialize yet
```

**Solução:**
```dockerfile
# Gerar Prisma Client em cada estágio que precisa
RUN npx prisma generate
```

### 2. **Hot Reload não funciona**
**Problema:**
- Mudanças no código não são detectadas

**Solução:**
```dockerfile
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
```

### 3. **Dependências do Tailwind**
**Problema:**
- Tailwind não compila corretamente

**Solução:**
```dockerfile
RUN npm install autoprefixer postcss tailwindcss tailwindcss-animate --save-dev
```

---

## 📝 Anotações Pessoais

### ❓ Dúvidas Levantadas:
- Por que usar multi-stage build?
- Por que gerar Prisma em cada estágio?
- O que são essas variáveis de ambiente?

### 💡 Soluções Testadas:
- Testei build sem `prisma generate` → erro de cliente não encontrado
- Testei sem variáveis de polling → hot reload não funcionou
- Testei com multi-stage → imagem de produção 50% menor

### 🚀 Aprendizados Finais:
- Multi-stage build é essencial para projetos profissionais
- Cada estágio tem propósito específico
- Cache de dependências acelera builds
- Prisma Client deve ser gerado em cada estágio que usa
- Variáveis de ambiente melhoram experiência de desenvolvimento

---

## 🔗 Próximos Estudos:
- [ ] Como funciona o docker-compose.yml
- [ ] Estratégias de desenvolvimento local vs container
- [ ] Otimizações avançadas de Dockerfile
- [ ] Debugging de containers