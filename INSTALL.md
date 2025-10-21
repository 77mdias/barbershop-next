# 🚀 Instalação e Setup Docker - Barbershop Next.js

## 📋 Instalação do Docker

````

```bash
# Verificar se está funcionando
````

# Verificar portas em uso

# Recrear containers

````

```bash
# Aguardar inicialização completa
````

````bash
```markdown
# 🚀 Instalação e Setup Docker - Resumo

Este arquivo apresenta um resumo prático de instalação e os passos iniciais para o projeto. Para um guia mais completo de Docker, consulte `DOCKER.md`.

### Verificar instalação do Docker (resumo)

```bash
docker --version
docker compose version
docker run hello-world
````

### Preparar projeto

```bash
git clone <repo-url>
cd barbershop-next
cp .env.example .env.development
chmod +x ./scripts/docker-manager.sh
./scripts/docker-manager.sh status
```

### Subir ambiente de desenvolvimento (recomendado)

```bash
./scripts/docker-manager.sh up dev
```

### Migrações, seed e Prisma Studio

```bash
./scripts/docker-manager.sh migrate dev
./scripts/docker-manager.sh seed dev
./scripts/docker-manager.sh studio dev
# Prisma Studio: http://localhost:5555
```

### Alternativa direta

```bash
docker compose up -d
```

### Notas

- Em produção, copie .env.production e use `./scripts/docker-manager.sh up prod`.
- Se houver problemas com `docker compose` versão, atualize para 2.x.

```

```
