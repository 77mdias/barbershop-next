# 💈 Barbershop Next.js

Sistema de agendamento para barbearias desenvolvido com Next.js, TypeScript, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Frontend**: Next.js 14+ com App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Banco de Dados**: PostgreSQL Serverless (Neon/Supabase)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **Infraestrutura**: Docker e Docker Compose

## 🛠️ Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Git

### Executando com Docker

```bash
# Ambiente de desenvolvimento
docker-compose up app

# Ambiente de produção
docker-compose up app-prod
```

- **Desenvolvimento**: http://localhost:3001
- **Produção**: http://localhost:8080

### Executando localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📚 Documentação

Consulte a pasta `docs/` para documentação detalhada:

- [Docker e Ambiente](/docs/docker/README.md)
- [Next.js e TypeScript](/docs/nextjs/README.md)
- [Banco de Dados](/docs/database/README.md)
- [Prisma ORM](/docs/prisma/README.md)

### 🗄️ Guias de Banco de Dados

- **[📋 Guia Completo de Desenvolvimento](/docs/database/GUIA-DESENVOLVIMENTO.md)** - Melhores práticas, fluxos de trabalho e procedimentos para desenvolvimento de banco de dados
- **[🛠️ Exemplos Práticos](/docs/database/EXEMPLOS-PRATICOS.md)** - Cenários reais, casos de uso e resolução de problemas
- **[⚙️ Scripts de Banco](/docs/database/SCRIPTS.md)** - Documentação dos scripts npm para gerenciamento de banco de dados

## 📝 Licença

Este projeto está sob a licença MIT.
