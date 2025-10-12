# 🎓 Guia de Treinamento - Novos Comandos Docker

## 📋 **Para a Equipe: Mudanças nos Comandos**

### 🔄 **O que Mudou**

A partir de agora, estamos usando a **Arquitetura Docker Profissional** que separa migrações da aplicação.

---

## 🚀 **Comandos Principais**

### 📦 **Desenvolvimento (NÃO MUDOU)**
```bash
# ✅ Continua igual - desenvolvimento local
docker compose up app                          # Desenvolvimento com logs
docker compose up -d                          # Em background
docker compose exec app npm install [pkg]     # Instalar dependência
docker compose exec app npx prisma migrate dev # Migrações dev
```

### 🏭 **Produção (MUDOU - NOVOS COMANDOS)**

#### **🎯 Comando Principal (Memorize este!):**
```bash
./scripts/deploy-pro.sh deploy
```
*Este comando faz TUDO: build, migrações, deploy da aplicação*

#### **🔧 Comandos Específicos:**
```bash
./scripts/deploy-pro.sh migrate     # Apenas migrações
./scripts/deploy-pro.sh app-only    # Apenas aplicação
./scripts/deploy-pro.sh logs        # Ver logs
./scripts/deploy-pro.sh status      # Status dos serviços
```

---

## ❌ **PARE de usar estes comandos:**

```bash
# ❌ NÃO USE MAIS
./scripts/deploy.sh deploy
docker compose -f docker-compose.prod.yml up -d
docker exec app npx prisma migrate deploy
```

---

## ✅ **USE agora estes comandos:**

```bash
# ✅ USE ESTES
./scripts/deploy-pro.sh deploy
docker compose -f docker-compose.pro.yml up -d app
./scripts/deploy-pro.sh migrate
```

---

## 🎯 **Cenários Práticos**

### 🔄 **Deploy Completo**
```bash
# Uma linha faz tudo!
./scripts/deploy-pro.sh deploy
```

### 🗄️ **Apenas Nova Migração**
```bash
# Se você criou uma nova migração
./scripts/deploy-pro.sh migrate
```

### 🚀 **Atualização da Aplicação (sem migração)**
```bash
./scripts/deploy-pro.sh app-only
```

### 📋 **Ver o que está acontecendo**
```bash
./scripts/deploy-pro.sh logs
./scripts/deploy-pro.sh status
```

### 🔧 **Troubleshooting**
```bash
# Ver logs de migrações
docker compose -f docker-compose.pro.yml logs migrator

# Executar migração manualmente
docker compose -f docker-compose.pro.yml --profile migration up migrator

# Acessar container para debug
docker compose -f docker-compose.pro.yml run --rm migrator sh
```

---

## 🚨 **Comandos de Emergência**

### ⚠️ **Se algo der errado:**
```bash
# 1. Parar tudo
docker compose -f docker-compose.pro.yml down

# 2. Ver logs
./scripts/deploy-pro.sh logs

# 3. Tentar deploy novamente
./scripts/deploy-pro.sh deploy
```

### 🆘 **Rollback para arquitetura antiga (só em emergência):**
```bash
# Voltar temporariamente
docker compose -f docker-compose.pro.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## 🎓 **Quiz Rápido**

### **Pergunta 1:** Como fazer deploy completo em produção?
**Resposta:** `./scripts/deploy-pro.sh deploy`

### **Pergunta 2:** Como ver logs da aplicação?
**Resposta:** `./scripts/deploy-pro.sh logs`

### **Pergunta 3:** Como aplicar apenas migrações?
**Resposta:** `./scripts/deploy-pro.sh migrate`

### **Pergunta 4:** Desenvolvimento mudou?
**Resposta:** Não! Continua `docker compose up app`

---

## 📈 **Benefícios para a Equipe**

### ✅ **Mais Seguro**
- Migrações isoladas da aplicação
- Falhas não derrubam a aplicação
- Container de produção mais limpo

### ✅ **Mais Simples**
- Um comando faz tudo: `./scripts/deploy-pro.sh deploy`
- Logs separados e mais claros
- Scripts inteligentes

### ✅ **Mais Rápido**
- Startup da aplicação 3x mais rápido
- Build otimizado com cache
- Imagens menores

---

## 📞 **Suporte**

### **Dúvidas?** Consulte:
- `docs/docker/README.md` - Documentação completa
- `docs/docker/PRODUCTION.md` - Guia de produção
- `./scripts/deploy-pro.sh help` - Ajuda do script

### **Problemas?** Execute:
```bash
./scripts/deploy-pro.sh status
./scripts/deploy-pro.sh logs
```

---

**🎯 Resumo: Memorize `./scripts/deploy-pro.sh deploy` e você está pronto!**