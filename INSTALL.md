# 🚀 Instalação e Setup Docker - Barbershop Next.js

## 📋 Instalação do Docker

### Ubuntu/Debian

```bash
# Atualizar sistema
sudo apt update

# Instalar dependências
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# Reiniciar sessão ou executar:
newgrp docker
```

### Fedora/CentOS/RHEL

```bash
# Instalar Docker
sudo dnf install docker docker-compose

# Iniciar e habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo
sudo usermod -aG docker $USER
```

### Arch Linux

```bash
# Instalar Docker
sudo pacman -S docker docker-compose

# Iniciar e habilitar
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo
sudo usermod -aG docker $USER
```

## 🔧 Configuração Inicial

### 1. Verificar Instalação

```bash
# Verificar versões
docker --version
docker-compose --version

# Testar Docker
docker run hello-world
```

### 2. Configurar Projeto

```bash
# Navegar para o projeto
cd /path/to/barbershop-next

# Dar permissão ao script
chmod +x scripts/docker-manager.sh

# Verificar status
./scripts/docker-manager.sh status
```

## 🚀 Primeiros Passos

### 1. Ambiente de Desenvolvimento

```bash
# Configurar ambiente
cp .env.example .env.development

# Editar variáveis (ajustar senhas, URLs, etc.)
nano .env.development

# Subir containers
./scripts/docker-manager.sh up dev

# Verificar se está funcionando
curl http://localhost:3000/api/health
```

### 2. Verificar Serviços

```bash
# Ver status dos containers
./scripts/docker-manager.sh status

# Ver logs
./scripts/docker-manager.sh logs dev

# Acessar aplicação
curl http://localhost:3000
```

### 3. Banco de Dados

```bash
# Executar migrações
./scripts/docker-manager.sh migrate dev

# Executar seed (dados de exemplo)
./scripts/docker-manager.sh seed dev

# Acessar Prisma Studio
./scripts/docker-manager.sh studio dev
# Abrir: http://localhost:5555
```

## 🧪 Teste de Funcionalidades

### Verificar Next.js

```bash
# Health check
curl http://localhost:3000/api/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ",
  "uptime": 123.456,
  "environment": "development",
  "database": {
    "status": "connected",
    "responseTime": "15ms"
  },
  "version": "1.0.0"
}
```

### Verificar PostgreSQL

```bash
# Acessar banco via Docker
./scripts/docker-manager.sh db dev

# Comandos SQL de teste:
\l                          # Listar bancos
\c barbershop_dev          # Conectar ao banco
\dt                        # Listar tabelas
SELECT COUNT(*) FROM "User"; # Contar usuários
\q                         # Sair
```

### Verificar Prisma

```bash
# Acessar Prisma Studio
./scripts/docker-manager.sh studio dev

# Ou abrir diretamente:
open http://localhost:5555
```

## 🐛 Solução de Problemas

### Docker não inicia

```bash
# Verificar status do serviço
sudo systemctl status docker

# Iniciar Docker
sudo systemctl start docker

# Verificar se o usuário está no grupo
groups $USER

# Se não estiver, adicionar:
sudo usermod -aG docker $USER
newgrp docker
```

### Containers não sobem

```bash
# Ver logs detalhados
docker-compose logs

# Rebuild sem cache
./scripts/docker-manager.sh rebuild dev

# Verificar portas em uso
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5432
```

### Problemas de rede

```bash
# Listar redes Docker
docker network ls

# Remover rede problemática
docker network rm barbershop-next_barbershop-network

# Recrear containers
docker-compose down
docker-compose up -d
```

### Banco não conecta

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs do banco
docker-compose logs db

# Aguardar inicialização completa
sleep 15
./scripts/docker-manager.sh migrate dev
```

### Limpeza completa

```bash
# Para e remove tudo
./scripts/docker-manager.sh clean

# Confirmar limpeza
docker system df
docker volume ls
```

## ⚡ Comandos Rápidos

```bash
# Setup inicial completo
cp .env.example .env.development
./scripts/docker-manager.sh up dev
./scripts/docker-manager.sh migrate dev
./scripts/docker-manager.sh seed dev

# Desenvolvimento diário
./scripts/docker-manager.sh up dev     # Subir
./scripts/docker-manager.sh logs dev   # Ver logs
./scripts/docker-manager.sh down dev   # Parar

# Verificação rápida
./scripts/docker-manager.sh status     # Status
curl http://localhost:3000/api/health  # Health check
```

## 📚 Próximos Passos

1. **Configurar produção**: Copiar `.env.example` para `.env.production`
2. **Setup CI/CD**: Configurar pipeline de deploy
3. **Monitoramento**: Configurar logs e métricas
4. **Backup**: Configurar backup automático do banco
5. **SSL**: Configurar certificados para HTTPS

## 🔗 Links Úteis

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/docker)