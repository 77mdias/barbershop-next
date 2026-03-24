# ===============================================
# 🐳 DOCKERFILE MULTI-STAGE UNIFICADO
# ===============================================
# Dockerfile otimizado com múltiplos stages para:
# - deps: Instalação de dependências (cache otimizado)
# - dev: Desenvolvimento com hot reload
# - builder: Build de produção
# - prod: Imagem final de produção
# ===============================================

# ==================
# STAGE 1: deps - Dependências base
# ==================
FROM node:20-alpine AS deps
WORKDIR /app

# Configurar timezone e instalar ferramentas essenciais
RUN apk update && apk add --no-cache \
    tzdata \
    git \
    github-cli \
    bash \
    zsh \
    curl \
    postgresql-client \
    && echo "Tools installed successfully"
ENV TZ=America/Sao_Paulo

# Copiar apenas arquivos de dependências para melhor cache
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# ==================
# STAGE 2: dev - Desenvolvimento
# ==================
FROM deps AS dev
WORKDIR /app

# Configurar git globalmente (para desenvolvimento)
RUN git config --global --add safe.directory /app

# Copiar todo o código para desenvolvimento
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor portas para desenvolvimento
EXPOSE 3000 5555

# Comando para desenvolvimento com hot reload
CMD ["sh", "-c", "./scripts/docker-entrypoint-dev.sh"]

# ==================
# STAGE 3: builder - Build de produção
# ==================
FROM deps AS builder
WORKDIR /app

# Copiar arquivos necessários para build
COPY src ./src/
COPY public ./public/
COPY next.config.mjs ./
COPY next.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.mjs ./
COPY components.json ./

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# ==================
# STAGE 4: prod - Produção
# ==================
FROM node:20-alpine AS prod
WORKDIR /app

# Configurar timezone
RUN apk update && apk add --no-cache tzdata || echo "Warning: tzdata package failed to install"
ENV TZ=America/Sao_Paulo

# Configurações de produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar dependências de produção
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copiar schema do Prisma para permitir migrações em produção
COPY --from=builder /app/prisma ./prisma/

# Copiar arquivos build e assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar script de inicialização
COPY scripts/docker-entrypoint-prod.sh /usr/local/bin/docker-entrypoint-prod.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-prod.sh

# Ajustar permissões
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Usar script de inicialização que aplica migrações automaticamente
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-prod.sh"]

# Comando de produção
CMD ["node", "server.js"]
