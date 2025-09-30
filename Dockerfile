# Estágio de dependências - usado como base para dev e prod
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Instalando dependências do projeto com npm install
RUN npm install && npm install autoprefixer postcss tailwindcss tailwindcss-animate --save-dev && npm cache clean --force

# Estágio de desenvolvimento - com hot reload
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Garantindo que o autoprefixer esteja instalado
RUN npm install autoprefixer postcss tailwindcss tailwindcss-animate --save-dev
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
# Gerando o Prisma Client antes do build
RUN npx prisma generate
RUN npm run build

# Estágio de produção - apenas o necessário para executar
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "start"]