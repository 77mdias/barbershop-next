# 🌍 Estrutura de Variáveis de Ambiente

## 📋 Visão Geral

Este documento explica como organizar e gerenciar variáveis de ambiente em projetos **Next.js** de forma profissional e segura.

### 🎯 Objetivos

- ✅ Separar configurações por ambiente (dev, staging, prod)
- ✅ Manter segurança e não vazar credenciais
- ✅ Facilitar deploy e colaboração em equipe
- ✅ Seguir boas práticas da indústria

---

## 📂 Estrutura de Arquivos

```
barbershop-next/
├── .env                    # 🔒 Desenvolvimento local (NÃO versionar)
├── .env.example           # ✅ Template seguro (versionar)
├── .env.production        # 🔒 Produção (NÃO versionar)
├── .env.staging           # 🔒 Homologação (NÃO versionar)
├── .env.local             # 🔒 Sobrescreve .env localmente
└── .gitignore             # 🛡️ Protege arquivos sensíveis
```

### 🔍 Explicação de Cada Arquivo

| Arquivo | Propósito | Versionado? | Quando Usar |
|---------|-----------|-------------|-------------|
| `.env` | Desenvolvimento local | ❌ Não | Trabalho diário |
| `.env.example` | Template/documentação | ✅ Sim | Onboarding de devs |
| `.env.production` | Configurações de produção | ❌ Não | Deploy final |
| `.env.staging` | Testes e homologação | ❌ Não | QA e validação |
| `.env.local` | Sobrescritas locais | ❌ Não | Configurações pessoais |

---

## 🔐 Categorias de Variáveis

### 1. **🌍 Ambiente Geral**
```bash
NODE_ENV=development|staging|production
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. **🗄️ Banco de Dados**
```bash
# PostgreSQL (Neon/Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db
```

### 3. **🔐 Autenticação**
```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

### 4. **📧 Email/SMTP**
```bash
# Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMTP Customizado
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 5. **💳 Pagamentos**
```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🚀 Workflow por Ambiente

### 🔧 **Desenvolvimento Local**

1. **Primeira vez:**
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais
   ```

2. **Configurações típicas:**
   ```bash
   NODE_ENV=development
   DATABASE_URL=postgresql://localhost:5432/barbershop_dev
   NEXTAUTH_URL=http://localhost:3001
   EMAIL_USER=test@gmail.com
   ```

### 🧪 **Staging/Homologação**

1. **Características:**
   - Dados de teste (não reais)
   - Configurações similares à produção
   - Emails de teste (Mailtrap)
   - Stripe em modo teste

2. **Exemplo:**
   ```bash
   NODE_ENV=staging
   DATABASE_URL=postgresql://staging-host:5432/barbershop_staging
   NEXTAUTH_URL=https://staging.barbershop.com
   SMTP_HOST=smtp.mailtrap.io
   ```

### 🚀 **Produção**

1. **Características:**
   - Dados reais
   - Máxima segurança
   - Performance otimizada
   - Monitoramento ativo

2. **Exemplo:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://prod-host:5432/barbershop_prod
   NEXTAUTH_URL=https://barbershop.com
   STRIPE_SECRET_KEY=sk_live_...
   ```

---

## 🛡️ Segurança e Boas Práticas

### ✅ **O que FAZER**

1. **Usar .env.example como documentação:**
   ```bash
   # ✅ Bom - sem dados reais
   DATABASE_URL=postgresql://username:password@host:5432/database
   
   # ✅ Bom - com comentários
   # Gmail App Password - https://myaccount.google.com/apppasswords
   EMAIL_PASSWORD=your-app-password-here
   ```

2. **Gerar secrets únicos por ambiente:**
   ```bash
   # Desenvolvimento
   NEXTAUTH_SECRET=dev-secret-123
   
   # Produção
   NEXTAUTH_SECRET=prod-super-complex-secret-456
   ```

3. **Usar prefixo NEXT_PUBLIC_ apenas quando necessário:**
   ```bash
   # ✅ Público - pode ser exposto no cliente
   NEXT_PUBLIC_API_URL=https://api.barbershop.com
   
   # ❌ Privado - NUNCA usar NEXT_PUBLIC_
   DATABASE_URL=postgresql://...
   ```

### ❌ **O que NÃO FAZER**

1. **Nunca commitar arquivos com dados reais:**
   ```bash
   # ❌ NUNCA faça isso
   git add .env
   git commit -m "Add environment variables"
   ```

2. **Nunca hardcodar secrets no código:**
   ```javascript
   // ❌ NUNCA faça isso
   const secret = "sk_live_real_stripe_key";
   
   // ✅ Sempre use process.env
   const secret = process.env.STRIPE_SECRET_KEY;
   ```

3. **Nunca usar dados de produção em desenvolvimento:**
   ```bash
   # ❌ NUNCA use banco de produção localmente
   DATABASE_URL=postgresql://prod-host:5432/barbershop_prod
   ```

---

## 🔧 Configuração do .gitignore

```gitignore
# ==================
# 🔒 ARQUIVOS DE AMBIENTE
# ==================
# Protege todos os arquivos .env com dados sensíveis
.env
.env.local
.env.production
.env.staging
.env.test

# ✅ PERMITE versionar apenas templates seguros
!.env.example

# Arquivos de backup de ambiente
.env.backup
.env.*.backup
```

---

## 🐳 Integração com Docker

### **docker-compose.yml**
```yaml
services:
  app:
    build: .
    env_file:
      - .env  # Desenvolvimento
    environment:
      - NODE_ENV=development
  
  app-prod:
    build: .
    env_file:
      - .env.production  # Produção
    environment:
      - NODE_ENV=production
```

### **Comandos Úteis**
```bash
# Desenvolvimento
docker-compose up app

# Produção
docker-compose up app-prod

# Verificar variáveis dentro do container
docker-compose exec app env | grep DATABASE_URL
```

---

## 🧪 Testando Configurações

### **1. Verificar se variáveis estão carregadas:**
```javascript
// pages/api/test-env.js
export default function handler(req, res) {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    hasNextAuth: !!process.env.NEXTAUTH_SECRET,
    // NUNCA exponha valores reais!
  });
}
```

### **2. Testar conexão com banco:**
```bash
# Dentro do container
docker-compose exec app npx prisma db pull
```

### **3. Testar envio de email:**
```bash
# Criar script de teste
node scripts/test-email.js
```

---

## 📋 Checklist de Deploy

### **🔧 Desenvolvimento → Staging**
- [ ] Copiar `.env.example` para `.env.staging`
- [ ] Configurar banco de staging
- [ ] Usar credenciais de teste (Stripe test, Mailtrap)
- [ ] Testar todas as funcionalidades

### **🚀 Staging → Produção**
- [ ] Copiar `.env.staging` para `.env.production`
- [ ] Trocar para credenciais de produção
- [ ] Configurar secrets no provedor (Vercel, AWS)
- [ ] Testar deploy em ambiente isolado
- [ ] Monitorar logs após deploy

---

## 🔗 Links Úteis

- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Google Cloud Console:** https://console.cloud.google.com/
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

## 🎓 Exercícios Práticos

### **Exercício 1: Setup Inicial**
1. Copie `.env.example` para `.env`
2. Configure suas credenciais de desenvolvimento
3. Teste a aplicação localmente

### **Exercício 2: Ambiente de Staging**
1. Crie conta no Mailtrap para emails de teste
2. Configure `.env.staging` com dados de teste
3. Faça deploy em ambiente de staging

### **Exercício 3: Segurança**
1. Verifique se `.env` está no `.gitignore`
2. Gere um novo `NEXTAUTH_SECRET`
3. Teste se variáveis públicas estão corretas

---

## 🚨 Troubleshooting

### **Problema: Variáveis não carregam**
```bash
# Verificar se arquivo existe
ls -la .env*

# Verificar sintaxe (sem espaços)
cat .env | grep "="
```

### **Problema: Erro de conexão com banco**
```bash
# Testar conexão
docker-compose exec app npx prisma db pull

# Verificar URL
echo $DATABASE_URL
```

### **Problema: NextAuth não funciona**
```bash
# Verificar secret
echo $NEXTAUTH_SECRET | wc -c  # Deve ter 32+ caracteres
```

---

## 📝 Resumo

A estrutura de variáveis de ambiente é **fundamental** para:

1. **🔒 Segurança:** Proteger credenciais e secrets
2. **🌍 Flexibilidade:** Diferentes configurações por ambiente  
3. **👥 Colaboração:** Facilitar trabalho em equipe
4. **🚀 Deploy:** Simplificar processo de produção

**Lembre-se:** Nunca commite dados reais, sempre use `.env.example` como documentação, e mantenha ambientes separados!