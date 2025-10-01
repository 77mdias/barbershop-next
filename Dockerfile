# Estágio de dependências - usado como base para dev e prod
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Instalando dependências do projeto com npm install
RUN npm install && npm cache clean --force

# Estágio de desenvolvimento - com hot reload
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dependências já instaladas no estágio deps
# Gerando o Prisma Client
RUN npx prisma generate
# Configurações para melhorar performance no WSL
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Estágio de build - compila a aplicação
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Gerando o Prisma Client no ambiente Alpine para garantir engines corretos
RUN npx prisma generate
RUN npm run build

# Estágio de produção - apenas o necessário para executar
FROM node:20-alpine AS prod
WORKDIR /app

# Copiando arquivos essenciais do builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js

# Copiando arquivos do Prisma (essencial para produção)
COPY --from=builder /app/prisma ./prisma

# Regenerando Prisma Client no ambiente de produção para garantir engines
RUN npx prisma generate

# Como já temos node_modules do builder, não precisamos reinstalar
# RUN npm ci --only=production && npm cache clean --force

# Variáveis de ambiente para Prisma
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node
ENV PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/query-engine-linux-musl-openssl-3.0.x

EXPOSE 3000
CMD ["npm", "start"]