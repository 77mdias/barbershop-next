# 🚀 Deployment - Barbershop Next

Guias de deploy e configuração de produção para o sistema Barbershop Next.

## 📚 Documentos Disponíveis

### 📦 Production Setup

- **[Production Storage](./production-storage.md)** - Estratégia de armazenamento em produção
  - Cloudinary para upload de imagens
  - Configuração de environment variables
  - Diferenças entre dev e prod
  - Detecção automática de ambiente (Vercel)
  - Migração de local para cloud storage

- **[Vercel Optimizations](./vercel-optimizations.md)** - Otimizações específicas para Vercel
  - Build optimizations
  - Remoção de sharp dependency
  - Cache strategies
  - Performance tips
  - Deploy configurations

- **[Email Setup](./email-setup.md)** - Configuração de envio de emails
  - Providers suportados (Gmail, SendGrid, etc.)
  - SMTP configuration
  - Email templates
  - Verificação de email
  - Password reset emails

---

## 🎯 Ambiente de Produção

### Características do Ambiente Prod

```bash
NODE_ENV=production
VERCEL=1 (quando em Vercel)
```

**Comportamentos específicos:**
- ✅ Cloudinary para uploads (filesystem read-only no Vercel)
- ✅ Cookies seguros (httpOnly, secure)
- ✅ Rate limiting ativo
- ✅ Error logging sem stack traces expostos
- ✅ Build otimizado para performance

### Variáveis de Ambiente Obrigatórias

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://seu-dominio.com"

# OAuth Providers
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Cloudinary (Production)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Email (Production)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="..."
EMAIL_SERVER_PASSWORD="..."
EMAIL_FROM="noreply@seu-dominio.com"
```

---

## 🐳 Deploy com Docker

### Development Mode

```bash
# Iniciar ambiente de desenvolvimento
docker compose up app

# Com rebuild
docker compose up --build app
```

### Production Mode (Docker Compose Pro)

```bash
# Deploy completo (migrations + app)
./scripts/deploy-pro.sh deploy

# Apenas migrations
./scripts/deploy-pro.sh migrate

# Apenas app
./scripts/deploy-pro.sh app-only

# Ver logs
./scripts/deploy-pro.sh logs

# Status dos serviços
./scripts/deploy-pro.sh status
```

### Arquitetura Multi-Stage

O projeto usa **separação de containers** para produção:

- **Container `migrator`**: Executa migrations, inclui pasta `prisma/`
- **Container `app`**: Apenas executa a aplicação, Prisma Client já gerado

**Benefícios:**
- 🔒 Segurança: app nunca altera schema em prod
- ⚡ Performance: imagem de produção menor e mais rápida
- 🎯 Controle: migrations rastreáveis e auditáveis

---

## 🌐 Deploy na Vercel

### Passo a Passo

1. **Conectar repositório ao Vercel**
   - Fazer push do código para GitHub
   - Importar projeto no Vercel dashboard

2. **Configurar Environment Variables**
   - Adicionar todas as variáveis obrigatórias
   - Configurar Cloudinary credentials
   - Configurar database URL (usar Vercel Postgres ou externo)

3. **Configurar Build Settings**
   ```json
   {
     "buildCommand": "npm run build:vercel",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```

4. **Aplicar Database Migrations**
   ```bash
   # Localmente ou via Vercel CLI
   npm run db:migrate:prod
   ```

5. **Deploy**
   - Push para branch principal → auto-deploy
   - Ou usar `vercel --prod` via CLI

### Otimizações Vercel

- ✅ `npm run build:vercel` remove sharp dependency
- ✅ Next.js 15 com App Router otimizado
- ✅ Static generation onde possível
- ✅ Image optimization nativo do Next.js
- ✅ Cloudinary para user-uploaded images

---

## 📧 Configuração de Email

### Providers Suportados

1. **Gmail** (desenvolvimento/teste)
   - Criar App Password no Google Account
   - Configurar SMTP com porta 587

2. **SendGrid** (produção recomendada)
   - Criar conta e obter API key
   - Configurar sender identity
   - Alta deliverability

3. **AWS SES** (escalável)
   - Setup IAM credentials
   - Configurar SMTP endpoints
   - Cost-effective para alto volume

### Testando Emails Localmente

```bash
# Usar MailHog (container Docker)
docker compose up mailhog

# Acessar interface: http://localhost:8025
# Configurar EMAIL_SERVER_HOST=mailhog
```

---

## 🔒 Checklist de Segurança em Produção

### Antes do Deploy

- [ ] Todas as secrets em variáveis de ambiente (nunca committed)
- [ ] `NEXTAUTH_SECRET` gerado com segurança (32+ chars)
- [ ] Database URL usa SSL (`?sslmode=require`)
- [ ] Rate limiting ativo para uploads
- [ ] CORS configurado corretamente
- [ ] CSP headers configurados (se aplicável)
- [ ] OAuth redirect URIs corretos

### Após o Deploy

- [ ] Testar login com todos os providers
- [ ] Verificar envio de emails
- [ ] Testar upload de imagens (Cloudinary)
- [ ] Verificar performance no Vercel Analytics
- [ ] Monitorar logs de erros
- [ ] Testar agendamentos end-to-end

---

## 📊 Monitoramento

### Logs

```bash
# Vercel CLI
vercel logs --follow

# Docker Compose
docker compose -f docker-compose.pro.yml logs -f app

# Logs de migrations
docker compose -f docker-compose.pro.yml logs migrator
```

### Métricas

- Vercel Analytics (automático)
- Prisma Pulse (opcional, para database monitoring)
- Sentry (opcional, para error tracking)
- Cloudinary dashboard para uso de storage

---

## 🆘 Troubleshooting

### Problema: Upload de imagens falha em produção

**Solução**: Verificar se Cloudinary está configurado
```bash
# Verificar env vars
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Testar upload via API
curl -X POST https://seu-app.vercel.app/api/upload/profile \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.jpg"
```

### Problema: Database migrations não aplicadas

**Solução**: Executar migrations via container migrator
```bash
./scripts/deploy-pro.sh migrate

# Ou manualmente
docker compose -f docker-compose.pro.yml --profile migration run --rm migrator
```

### Problema: Emails não estão sendo enviados

**Solução**: Verificar configuração SMTP
1. Testar credenciais com `telnet smtp.gmail.com 587`
2. Verificar logs do Vercel: `vercel logs`
3. Confirmar que `EMAIL_SERVER_*` vars estão setadas
4. Verificar se Gmail App Password está correto

---

## 🔗 Links Relacionados

- [Docker Guide](../docker/PRODUCTION.md) - Deploy profissional com Docker
- [Database Scripts](../database/SCRIPTS.md) - Scripts úteis de database
- [Development Guide](../development/README.md) - Ambiente de desenvolvimento

---

**Última atualização**: 15 de Novembro de 2025
