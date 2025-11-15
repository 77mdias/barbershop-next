# Guia Completo: Start-Project com Docker para Devs Full Stack

## Sumário

- [Objetivo](#objetivo)
- [Visão Geral dos Ambientes](#visão-geral-dos-ambientes)
- [Estrutura de Arquivos Sugerida](#estrutura-de-arquivos-sugerida)
- [Configuração dos Ambientes](#configuração-dos-ambientes)
  - [Desenvolvimento](#desenvolvimento)
  - [Produção](#produção)
  - [Testes (opcional)](#testes-opcional)
- [Boas Práticas com Docker](#boas-práticas-com-docker)
- [Fluxo de Migrations](#fluxo-de-migrations-com-prisma)
- [Comandos Úteis](#comandos-úteis)
- [Regras e Condutas](#regras-e-condutas)
- [Referências](#referências)

---

## Objetivo

Padronizar e facilitar o início de projetos Node.js/Next.js (ou similares) usando Docker, garantindo ambientes isolados, reprodutíveis e prontos para CI/CD, evitando o clássico “na minha máquina funciona”.

---

## Visão Geral dos Ambientes

- **Desenvolvimento**: App e banco rodam em containers locais, com hot-reload e volumes mapeados.
- **Produção**: App roda em container otimizado; banco preferencialmente externo/cloud (Neon, Supabase, RDS etc).
- **Testes (futuro)**: Containers isolados para rodar testes automatizados, com banco zerado/resetável.

---

## Estrutura de Arquivos Sugerida

```
project-root/
├── docker-compose.yml              # Compose para desenvolvimento
├── docker-compose.prod.yml         # Compose para produção
├── docker-compose.test.yml         # Compose para testes (opcional)
├── Dockerfile.dev                  # Dockerfile para dev
├── Dockerfile.prod                 # Dockerfile para prod
├── .env.development
├── .env.production
├── .env.test                       # (opcional)
├── prisma/
│   └── schema.prisma
└── src/
    └── ...
```

---

## Configuração dos Ambientes

### Desenvolvimento

**docker-compose.yml**

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    env_file:
      - .env.development
    depends_on:
      - db

volumes:
  pgdata:
```

**Dockerfile.dev**

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

**.env.development**

```
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@db:5432/appdb
```

---

### Produção

**docker-compose.prod.yml**

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    env_file:
      - .env.production
    ports:
      - "3000:3000"
```

**Dockerfile.prod**

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**.env.production**

```
NODE_ENV=production
DATABASE_URL=postgresql://user:senha@host-cloud:5432/appdb?sslmode=require
```

---

### Testes (opcional)

- Use um compose próprio, com banco isolado e scripts para rodar testes.
- Recomenda-se usar `--exit-code-from` para falhar o pipeline se o teste der erro.

**docker-compose.test.yml**

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: testdb
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://test:test@db:5432/testdb
    depends_on:
      - db
    command: ["npm", "run", "test"]
```

---

## Boas Práticas com Docker

- **Nunca instale dependências globalmente.** Use sempre o container.
- **Use arquivos `.env` separados** para cada ambiente.
- **Mapeie volumes** para hot-reload só em desenvolvimento.
- **Nunca copie arquivos desnecessários para a imagem de produção**.
- **Nunca inclua dados sensíveis no código/commit**—apenas em `.env` (e adicione ao `.gitignore`).

---

## Fluxo de Migrations com Prisma

1. **Desenvolvimento:**
   ```sh
   docker-compose exec app npx prisma migrate dev
   ```
2. **Produção:**
   - Gere migrations no dev e faça commit.
   - Aplique no banco de produção:
   ```sh
   npx prisma migrate deploy --env-file .env.production
   ```
   - Nunca edite o banco de produção manualmente.

---

## Comandos Úteis

- Subir dev:
  ```sh
  docker-compose up --build
  ```
- Subir prod:
  ```sh
  docker-compose -f docker-compose.prod.yml up --build
  ```
- Rodar testes:
  ```sh
  docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
  ```
- Instalar dependência (dev):
  ```sh
  docker-compose exec app npm install nome-do-pacote
  ```

---

## Regras e Condutas

- **Commite sempre as migrations** geradas pelo Prisma.
- **Não suba dados sensíveis ao git.**
- **Garanta que todos rodem o projeto via Docker!**  
  (Documente no README, facilite o onboarding.)
- **Use o mesmo fluxo em CI/CD** (GitHub Actions, etc).
- **Isolamento:** nunca use banco local da sua máquina, só containers/cloud.
- **Mantenha cada ambiente com seu próprio banco.**
- **Reproduza bugs em containers:** nunca diga "na minha máquina funciona".

---

## Referências

- [Documentação Docker Compose](https://docs.docker.com/compose/)
- [Prisma com Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)
- [12 Factor App](https://12factor.net/)

---

**Mantenha esse guia atualizado conforme as necessidades do time evoluírem!**
