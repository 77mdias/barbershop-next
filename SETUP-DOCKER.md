# 🎉 Setup Docker Completo - Barbershop Next.js

## ✅ O que foi configurado

### 🐳 **Dockerfiles Otimizados**
- **Dockerfile.dev**: Desenvolvimento com hot reload, cache otimizado
- **Dockerfile.prod**: Produção multi-stage, imagem mínima (~200MB)

### 🔧 **Docker Compose**
- **docker-compose.yml**: Desenvolvimento com PostgreSQL, hot reload
- **docker-compose.prod.yml**: Produção com NGINX, health checks

### 📦 **Scripts e Automação**
- **docker-manager.sh**: Script completo para gerenciar ambientes
- **init-db.sql**: Inicialização automática do PostgreSQL
- **nginx.conf**: Proxy reverso com segurança e performance

### � **Segurança e Performance**
- **Desenvolvimento**: Configuração simplificada para compatibilidade de volumes
- **Produção**: Containers não-root, multi-stage build, security hardening
- **Isolamento**: Rede Docker dedicada para comunicação entre serviços
- **Rate limiting**: NGINX configurado para proteção em produção
- **Health checks**: Monitoramento ativo dos serviços
- **Build otimizado**: Cache inteligente para builds rápidos

## 🚀 Comandos Essenciais

### 1. **Instalação Inicial**
```bash
# Instalar Docker (Ubuntu/Debian)
sudo apt update && sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# Clonar e configurar projeto
git clone <repo-url>
cd barbershop-next
cp .env.example .env.development
chmod +x scripts/docker-manager.sh
```

### 2. **Desenvolvimento**
```bash
# Subir ambiente completo
npm run docker:dev
# ou
./scripts/docker-manager.sh up dev

# Ver status
npm run docker:status

# Ver logs
npm run docker:dev:logs

# Acessar shell do container
npm run docker:dev:shell

# Executar migrações
npm run docker:dev:migrate

# Executar seed
npm run docker:dev:seed

# Abrir Prisma Studio
npm run docker:dev:studio
```

### 3. **Produção**
```bash
# Configurar ambiente
cp .env.example .env.production
# Editar .env.production com valores reais

# Subir produção
npm run docker:prod

# Ver logs de produção
./scripts/docker-manager.sh logs prod

# Executar migrações em produção
./scripts/docker-manager.sh migrate prod
```

### 4. **Utilitários**
```bash
# Ver status de todos containers
npm run docker:status

# Acessar banco PostgreSQL
./scripts/docker-manager.sh db dev

# Limpeza completa
npm run docker:clean

# Help completo
./scripts/docker-manager.sh
```

## 🌐 URLs Disponíveis

### Desenvolvimento
| Serviço | URL | Descrição |
|---------|-----|-----------|
| Next.js | http://localhost:3000 | Aplicação principal |
| Prisma Studio | http://localhost:5555 | Interface do banco |
| Health Check | http://localhost:3000/api/health | Status da aplicação |
| PostgreSQL | localhost:5432 | Banco de dados |

### Produção
| Serviço | URL | Descrição |
|---------|-----|-----------|
| Next.js | http://localhost:3000 | Aplicação principal |
| NGINX | http://localhost:80 | Proxy (opcional) |
| Health Check | http://localhost:3000/api/health | Status da aplicação |

## 📋 Checklist de Verificação

### ✅ Desenvolvimento
- [ ] Docker instalado e funcionando
- [ ] `.env.development` configurado
- [ ] Containers sobem sem erro: `npm run docker:dev`
- [ ] App responde: `curl http://localhost:3000`
- [ ] Health check OK: `curl http://localhost:3000/api/health`
- [ ] Banco conecta: `./scripts/docker-manager.sh db dev`
- [ ] Prisma Studio abre: http://localhost:5555
- [ ] Hot reload funciona (editar arquivo e ver mudança)

### ✅ Produção
- [ ] `.env.production` configurado
- [ ] Build funciona: `./scripts/docker-manager.sh build prod`
- [ ] Containers sobem: `npm run docker:prod`
- [ ] App responde em produção
- [ ] Health check OK
- [ ] Migrações executadas

## 🔒 Considerações de Segurança

### ⚠️ **Desenvolvimento vs Produção**

**Desenvolvimento (Atual):**
- Container roda como **root** para compatibilidade com volumes montados
- Configuração **simplificada** para facilitar debugging
- PostgreSQL **exposto** na porta 5432 para acesso local
- **SEGURO** apenas para ambiente local isolado

**Produção (Configurado):**
- Containers rodam como **usuário não-privilegiado**
- **Multi-stage build** com imagem mínima
- PostgreSQL **não exposto** diretamente
- **NGINX** com rate limiting e headers de segurança
- **Health checks** e resource limits ativos

### 🛡️ **Recomendações de Segurança**

```bash
# ✅ Para desenvolvimento local
./scripts/docker-manager.sh up dev

# ❌ NUNCA em produção
# Esta configuração de dev NÃO deve ser usada em servidores

# ✅ Para produção
./scripts/docker-manager.sh up prod
```

### 🚨 **Importante**
- A configuração de desenvolvimento é **otimizada para produtividade**
- Use **sempre** a configuração de produção em servidores
- O Dockerfile.prod já inclui todas as melhores práticas de segurança

---

1. **Configurar CI/CD** - GitHub Actions para deploy automático
2. **Backup automático** - Script para backup do PostgreSQL
3. **Monitoramento** - Logs estruturados e métricas
4. **SSL/HTTPS** - Certificados para produção
5. **Scaling** - Docker Swarm ou Kubernetes

## 🆘 Suporte

### Problemas Comuns
- **Docker não inicia**: `sudo systemctl start docker`
- **Permissão negada**: `sudo usermod -aG docker $USER; newgrp docker`
- **Porta ocupada**: `sudo netstat -tulpn | grep :3000`
- **Containers não sobem**: `./scripts/docker-manager.sh rebuild dev`

### Logs e Debug
```bash
# Ver todos os logs
./scripts/docker-manager.sh logs dev

# Ver logs específicos
docker-compose logs app
docker-compose logs db

# Debug do container
./scripts/docker-manager.sh shell dev
ps aux
df -h
env | grep -i data
```

## 📚 Documentação

- **INSTALL.md** - Guia de instalação detalhado
- **DOCKER.md** - Documentação completa do Docker
- **README.md** - Informações gerais do projeto
- **.github/copilot-instructions.md** - Guia para agentes AI

---

🎉 **Configuração Docker completa!** Seu ambiente está pronto para desenvolvimento e produção profissional.