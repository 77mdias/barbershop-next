# ===============================================
# 🐳 DOCKERFILE OTIMIZADO - PRODUÇÃO PROFISSIONAL
# ===============================================
# Seguindo melhores práticas de produção

# ==================
# STAGE 1: Base dependencies
# ==================
FROM node:20-alpine AS base
WORKDIR /app

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        tzdata \
        dumb-init && \
    rm -rf /var/cache/apk/*

ENV TZ=America/Sao_Paulo

# ==================
# STAGE 2: Dependencies installation
# ==================
FROM base AS deps

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with exact versions
RUN npm ci --frozen-lockfile --only=production && \
    npm cache clean --force

# ==================
# STAGE 3: Build stage
# ==================
FROM base AS builder

# Copy dependency files and install all deps (including dev)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --frozen-lockfile

# Copy source code
COPY src ./src/
COPY public ./public/
COPY next.config.mjs ./
COPY next.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.mjs ./
COPY components.json ./

# Generate Prisma client and build
RUN npx prisma generate && \
    npm run build

# ==================
# STAGE 4: Migration runner (separado)
# ==================
FROM base AS migrator

# Copy only what's needed for migrations
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules/
COPY --from=deps /app/prisma ./prisma/

# Create migration user
RUN addgroup -g 1001 -S migrator && \
    adduser -S migrator -u 1001 -G migrator

USER migrator

# Migration entrypoint
ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "prisma", "migrate", "deploy"]

# ==================
# STAGE 5: Production runtime (LIMPO)
# ==================
FROM base AS production

# Security: Create non-root user FIRST
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Change to nextjs user BEFORE copying files
USER nextjs

# Copy only production dependencies with correct ownership
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules/

# Copy built application with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Security settings
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Proper health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]