# 🚀 Guia Completo de Deploy em Produção

## 📋 Visão Geral

Este guia te levará do desenvolvimento local até uma aplicação rodando em **produção** no Vercel, com todas as configurações necessárias.

### 🎯 O que você vai aprender:
- ✅ Como fazer deploy no Vercel
- ✅ Configurar variáveis de ambiente de produção
- ✅ Configurar banco de dados de produção
- ✅ Testar e monitorar a aplicação

---

## 🛠️ Pré-requisitos

### **1. Contas Necessárias:**
- [ ] **GitHub** - para versionamento
- [ ] **Vercel** - para deploy (gratuito)
- [ ] **Neon/Supabase** - para banco PostgreSQL (gratuito)

### **2. Preparação Local:**
```bash
# Verificar se tudo está funcionando
npm run build
npm run start

# Verificar se Prisma está ok
npx prisma generate
npx prisma db pull
```

---

## 🚀 Passo a Passo do Deploy

### **Etapa 1: Preparar o Repositório**

1. **Commitar todas as mudanças:**
   ```bash
   git add .
   git commit -m "feat: preparar para deploy em produção"
   git push origin main
   ```

2. **Verificar arquivos criados:**
   - ✅ `vercel.json` - configuração do Vercel
   - ✅ `.vercelignore` - arquivos a ignorar
   - ✅ `scripts/deploy-vercel.sh` - script de deploy

### **Etapa 2: Configurar Banco de Produção**

#### **Opção A: Neon (Recomendado)**
1. Acesse: https://neon.tech/
2. Crie uma nova conta (gratuito)
3. Crie um novo projeto: `barbershop-prod`
4. Copie a **Connection String**:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

#### **Opção B: Supabase**
1. Acesse: https://supabase.com/
2. Crie um novo projeto
3. Vá em **Settings > Database**
4. Copie a **Connection String**

### **Etapa 3: Deploy no Vercel**

#### **3.1 Primeira vez:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy inicial (preview)
./scripts/deploy-vercel.sh
```

#### **3.2 Deploy para produção:**
```bash
# Deploy final
./scripts/deploy-vercel.sh --production
```

### **Etapa 4: Configurar Variáveis de Ambiente**

1. **Acesse o Dashboard do Vercel:**
   - https://vercel.com/dashboard
   - Selecione seu projeto

2. **Vá em Settings > Environment Variables**

3. **Configure as variáveis obrigatórias:**

#### **🗄️ Banco de Dados**
```bash
# Nome: DATABASE_URL
# Valor: postgresql://user:pass@host/db?sslmode=require
# Environment: Production

# Nome: DIRECT_URL  
# Valor: postgresql://user:pass@host/db?sslmode=require
# Environment: Production
```

#### **🔐 Autenticação**
```bash
# Nome: NEXTAUTH_URL
# Valor: https://seu-app.vercel.app
# Environment: Production

# Nome: NEXTAUTH_SECRET
# Valor: [gerar novo secret]
# Environment: Production
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### **📧 Email (Gmail)**
```bash
# Nome: EMAIL_USER
# Valor: seu-email@gmail.com
# Environment: Production

# Nome: EMAIL_PASSWORD
# Valor: sua-app-password
# Environment: Production
```

#### **🔑 Google OAuth**
```bash
# Nome: GOOGLE_CLIENT_ID
# Valor: seu-google-client-id
# Environment: Production

# Nome: GOOGLE_CLIENT_SECRET
# Valor: seu-google-client-secret
# Environment: Production
```

### **Etapa 5: Configurar OAuth para Produção**

#### **5.1 Google OAuth:**
1. Acesse: https://console.cloud.google.com/
2. Vá em **Credentials > OAuth 2.0 Client IDs**
3. **Edite** seu cliente OAuth
4. **Adicione** nas **Authorized redirect URIs:**
   ```
   https://seu-app.vercel.app/api/auth/callback/google
   ```

#### **5.2 Atualizar NextAuth:**
Verifique se `src/lib/auth.ts` tem:
```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  })
]
```

### **Etapa 6: Executar Migrações em Produção**

1. **Após deploy, execute:**
   ```bash
   # Conectar ao banco de produção
   DATABASE_URL="sua-url-de-producao" npx prisma migrate deploy
   
   # Ou use o script
   npm run db:migrate:prod
   ```

2. **Verificar se funcionou:**
   ```bash
   DATABASE_URL="sua-url-de-producao" npx prisma studio
   ```

---

## ✅ Checklist de Validação

### **🔧 Funcionalidades Básicas:**
- [ ] Site carrega sem erros
- [ ] Páginas principais funcionam
- [ ] CSS/Tailwind aplicado corretamente

### **🔐 Autenticação:**
- [ ] Login com Google funciona
- [ ] Logout funciona
- [ ] Sessão persiste após reload

### **🗄️ Banco de Dados:**
- [ ] Conexão estabelecida
- [ ] Queries funcionam
- [ ] Dados são salvos corretamente

### **📧 Email:**
- [ ] Emails de verificação são enviados
- [ ] Templates estão corretos
- [ ] Links funcionam

### **🚀 Performance:**
- [ ] Site carrega rápido (<3s)
- [ ] Imagens otimizadas
- [ ] Sem erros no console

---

## 🐛 Troubleshooting Comum

### **Erro: "Database connection failed"**
```bash
# Verificar URL de conexão
echo $DATABASE_URL

# Testar conexão
npx prisma db pull
```

### **Erro: "NextAuth configuration error"**
```bash
# Verificar se NEXTAUTH_URL está correto
# Deve ser: https://seu-app.vercel.app (sem barra no final)

# Verificar se NEXTAUTH_SECRET tem 32+ caracteres
echo $NEXTAUTH_SECRET | wc -c
```

### **Erro: "Google OAuth redirect_uri_mismatch"**
1. Vá no Google Cloud Console
2. Adicione a URL correta:
   ```
   https://seu-app.vercel.app/api/auth/callback/google
   ```

### **Erro: "Prisma Client not found"**
```bash
# Regenerar Prisma Client
npx prisma generate

# Fazer novo deploy
vercel --prod
```

---

## 📊 Monitoramento e Logs

### **1. Logs do Vercel:**
```bash
# Ver logs em tempo real
vercel logs seu-app.vercel.app

# Ver logs de uma função específica
vercel logs seu-app.vercel.app --follow
```

### **2. Monitoramento de Banco:**
- **Neon:** Dashboard > Monitoring
- **Supabase:** Dashboard > Reports

### **3. Analytics (Opcional):**
```bash
# Adicionar Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🔄 Workflow de Deploy Contínuo

### **Desenvolvimento → Produção:**
```bash
# 1. Desenvolver localmente
npm run dev

# 2. Testar build
npm run build
npm run start

# 3. Commitar mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 4. Deploy automático (se configurado)
# Ou manual:
./scripts/deploy-vercel.sh --production
```

### **Configurar Deploy Automático:**
1. No Vercel Dashboard
2. Settings > Git
3. Ativar **Auto Deploy**
4. Escolher branch: `main`

---

## 💡 Dicas de Produção

### **🔒 Segurança:**
- ✅ Use HTTPS sempre
- ✅ Secrets únicos por ambiente
- ✅ Rate limiting nas APIs
- ✅ Validação de inputs

### **🚀 Performance:**
- ✅ Otimize imagens (Next.js Image)
- ✅ Use cache quando possível
- ✅ Minimize bundle size
- ✅ Configure CDN

### **📊 Monitoramento:**
- ✅ Configure error tracking (Sentry)
- ✅ Monitor uptime
- ✅ Acompanhe métricas de performance
- ✅ Configure alertas

---

## 🎯 Próximos Passos

Após deploy em produção:

1. **📈 Analytics:** Configurar Google Analytics
2. **🛡️ Segurança:** Implementar rate limiting
3. **📧 Email:** Configurar templates profissionais
4. **💳 Pagamentos:** Integrar Stripe (se necessário)
5. **🧪 Staging:** Criar ambiente de homologação

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique logs:** `vercel logs`
2. **Teste localmente:** `npm run build && npm start`
3. **Consulte documentação:** 
   - [Vercel Docs](https://vercel.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Prisma Docs](https://www.prisma.io/docs)

---

## 🎉 Parabéns!

Se chegou até aqui, sua aplicação está rodando em **produção**! 🚀

Agora você tem:
- ✅ App Next.js em produção
- ✅ Banco PostgreSQL configurado
- ✅ Autenticação funcionando
- ✅ Deploy automatizado
- ✅ Monitoramento básico

**Próximo passo:** Criar ambiente de staging para testes! 🧪