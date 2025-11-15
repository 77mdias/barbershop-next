# 📚 Documentação - Barbershop Next

Bem-vindo à documentação completa do sistema Barbershop Next! Esta é uma aplicação moderna de agendamento para barbearias, construída com Next.js 15, TypeScript, Prisma ORM e NextAuth.js.

## 📖 Índice Geral

### 🏗️ [Architecture](./architecture/)
Documentação sobre a arquitetura do sistema, padrões de código e estruturas fundamentais.

- [Server Actions](./architecture/server-actions.md) - Padrões de Server Actions e Server Components
- [API Examples](./architecture/api-examples.md) - Exemplos de uso da API
- [Database Model](./architecture/database-model.md) - Estudo do modelo de dados
- [Prisma Queries](./architecture/prisma-queries.md) - Exemplos práticos de consultas Prisma
- [Relationships](./architecture/relationships.md) - Guia de relacionamentos entre modelos
- [Business Rules](./architecture/business-rules.md) - Regras de negócio da aplicação
- [Roles & Permissions](./architecture/roles-permissions.md) - Sistema de permissões e roles

### ⚡ [Features](./features/)
Documentação detalhada de cada funcionalidade do sistema.

- [Appointment System](./features/appointment-system.md) - Sistema de agendamentos
- [Chat System](./features/chat-system.md) - Sistema de chat 1:1 entre amigos
- [Notification System](./features/notification-system.md) - Sistema completo de notificações
- [Notifications Overview](./features/notifications-overview.md) - Visão geral do sistema de notificações
- [Review System](./features/review-system.md) - Sistema de avaliações com imagens
- [Upload System](./features/upload-system.md) - Sistema híbrido de upload (local + Cloudinary)
- [Vouchers & Promotions](./features/vouchers-promotions.md) - Sistema de vales e promoções
- [Theme System](./features/theme-system.md) - Sistema de temas claro/escuro
- [Theme Impact Analysis](./features/theme-impact-analysis.md) - Análise de impacto do sistema de temas
- [Theme Deployment Fix](./features/theme-deployment-fix.md) - Correções de deployment do tema
- [Gallery Component](./features/gallery-component.md) - Componente de galeria de imagens
- [Gallery Integration](./features/gallery-integration.md) - Exemplos de integração da galeria
- [Dashboard Admin](./features/dashboard-admin.md) - Dashboard administrativo
- [Dashboard Barber](./features/dashboard-barber.md) - Dashboard do barbeiro

### 🗄️ [Database](./database/)
Documentação específica sobre banco de dados e Prisma ORM.

- [README](./database/README.md) - Visão geral do banco de dados
- [Guia de Desenvolvimento](./database/GUIA-DESENVOLVIMENTO.md) - Melhores práticas com Prisma
- [Exemplos Práticos](./database/EXEMPLOS-PRATICOS.md) - Exemplos práticos de uso
- [Scripts](./database/SCRIPTS.md) - Scripts úteis de banco de dados

### 🐳 [Docker](./docker/)
Documentação sobre containerização e deploy com Docker.

- [README](./docker/README.md) - Visão geral do setup Docker
- [Guia Multi-Stage](./docker/GUIA-MULTI-STAGE.md) - Build multi-stage para produção
- [Production](./docker/PRODUCTION.md) - Deploy profissional em produção
- [Team Training](./docker/TEAM_TRAINING.md) - Treinamento da equipe
- [Migration](./docker/MIGRATION.md) - Migração para Docker
- [Decision](./docker/DECISION.md) - Decisões arquiteturais
- [Comandos Rápidos](./docker/COMANDOS-RAPIDOS.md) - Comandos úteis do Docker

### 🚀 [Deployment](./deployment/)
Guias de deploy e configuração de produção.

- [Production Storage](./deployment/production-storage.md) - Estratégia de armazenamento em produção
- [Vercel Optimizations](./deployment/vercel-optimizations.md) - Otimizações para Vercel
- [Email Setup](./deployment/email-setup.md) - Configuração de email

### 🧪 [Testing](./testing/)
Documentação sobre testes e quality assurance.

- [Overview](./testing/overview.md) - Visão geral dos testes (55 testes, 100% passing)
- [Test Flows](./testing/test-flows.md) - Fluxos de teste principais
- [Loading States](./testing/loading-states.md) - Testes de estados de loading

### 📋 [Tasks](./tasks/)
Gerenciamento de tarefas e implementações.

- [TASKS.md](./tasks/TASKS.md) - Lista completa de tarefas
- [Completed](./tasks/completed/) - Tarefas concluídas
- [In Progress](./tasks/in-progress/) - Tarefas em andamento

### 🛠️ [Development](./development/)
Documentação de desenvolvimento, roadmap e changelog.

- [README](./development/README.md) - Visão geral do desenvolvimento
- [ROADMAP](./development/ROADMAP.md) - Roadmap do projeto
- [CHANGELOG](./development/CHANGELOG.md) - Histórico de mudanças

### 📖 [Guides](./guides/)
Guias práticos e documentação de apoio.

- [Features Overview](./guides/features-overview.md) - Visão geral de todas as features
- [Demo Sales](./guides/demo-sales.md) - Guia de demonstração e vendas
- [Documentation](./guides/documentation.md) - Guia de documentação
- [Documentation Updates](./guides/documentation-updates.md) - Resumo de atualizações
- [Decisions](./guides/decisions.md) - Decisões importantes do projeto

### 📚 [Study](./study/)
Material de estudo e conceitos fundamentais.

- [README](./study/README.md) - Índice do material de estudo
- [01 - Prisma: Conceitos Fundamentais](./study/01-prisma-conceitos-fundamentais.md)
- [02 - Docker: Conceitos Fundamentais](./study/02-docker-conceitos-fundamentais.md)
- [03 - Dockerfile Explicado](./study/03-dockerfile-explicado-linha-por-linha.md)
- [04 - Docker Compose Explicado](./study/04-docker-compose-explicado.md)
- [05 - Desenvolvimento Local vs Container](./study/05-desenvolvimento-local-vs-container.md)
- [06 - Guia de Resolução de Problemas](./study/06-guia-resolucao-problemas.md)
- [07 - Estrutura de Variáveis de Ambiente](./study/07-estrutura-variaveis-ambiente.md)
- [08 - Guia de Deploy em Produção](./study/08-guia-deploy-producao.md)
- [09 - Dependências Compatíveis](./study/09-dependencias-compativeis.md)
- [10 - Guia de Agentes Next.js](./study/10-guia-agentes-nextjs.md)
- [11 - Start Projects Docker Guide](./study/11-START-PROJECTS-DOCKER-GUIDE.md)

---

## 🚀 Quick Start

### Primeiros Passos

1. **Leia o [README.md principal](../README.md)** do projeto
2. **Configure o ambiente** seguindo o [Docker Setup](./docker/README.md)
3. **Entenda a arquitetura** começando por [Server Actions](./architecture/server-actions.md)
4. **Explore as features** em [Features](./features/)

### Para Desenvolvedores Novos

1. [Guia de Desenvolvimento](./development/README.md) - Comece aqui!
2. [Material de Estudo](./study/README.md) - Conceitos fundamentais
3. [Database Guide](./database/GUIA-DESENVOLVIMENTO.md) - Trabalhe com Prisma
4. [Docker Quick Commands](./docker/COMANDOS-RAPIDOS.md) - Comandos essenciais

### Para Features Específicas

- **Implementar Agendamentos?** → [Appointment System](./features/appointment-system.md)
- **Trabalhar com Notificações?** → [Notification System](./features/notification-system.md)
- **Configurar Upload de Imagens?** → [Upload System](./features/upload-system.md)
- **Criar Testes?** → [Testing Overview](./testing/overview.md)

---

## 🔧 Comandos Essenciais

### Docker (Obrigatório)
```bash
# Iniciar desenvolvimento
docker compose up app

# Executar comandos no container
docker compose exec app npm run dev
docker compose exec app npx prisma studio

# Ver logs
docker compose logs -f app
```

### Database
```bash
# Migrations
docker compose exec app npx prisma migrate dev

# Seed database
docker compose exec app npx tsx prisma/seed.ts

# Prisma Studio
docker compose exec app npx prisma studio
```

### Desenvolvimento
```bash
# Linting e type-checking
docker compose exec app npm run lint:check
docker compose exec app npm run type-check
docker compose exec app npm run validate

# Testes
docker compose exec app npm test
```

---

## 📊 Status do Projeto

- ✅ **55 testes** implementados (100% passing)
- ✅ **Docker-first** development
- ✅ **TypeScript** strict mode parcial
- ✅ **Prisma ORM** com migrations
- ✅ **NextAuth.js** com OAuth (GitHub, Google) + Email/Password
- ✅ **Sistema de Notificações** completo
- ✅ **Sistema de Chat** 1:1
- ✅ **Upload híbrido** (Local + Cloudinary)
- ✅ **Sistema de Temas** (Light/Dark mode)

---

## 🤝 Contribuindo

1. Leia o [Guia de Desenvolvimento](./development/README.md)
2. Siga os [padrões de código](./architecture/server-actions.md)
3. Execute os testes antes de commitar
4. Atualize a documentação quando necessário

---

## 📞 Suporte

- **Bugs e Issues**: Crie uma issue no repositório
- **Dúvidas sobre Features**: Consulte a [documentação específica](./features/)
- **Problemas com Docker**: Veja o [guia de troubleshooting](./study/06-guia-resolucao-problemas.md)
- **Dúvidas sobre Database**: Consulte o [Database Guide](./database/GUIA-DESENVOLVIMENTO.md)

---

## 📝 Notas Importantes

⚠️ **Este é um projeto Docker-first**: NUNCA execute comandos npm/npx diretamente no host. Sempre use `docker compose exec app <comando>`.

⚠️ **Migrations**: As migrations só devem ser criadas em desenvolvimento. Em produção, use o container `migrator` separado.

⚠️ **Environment Variables**: Certifique-se de configurar corretamente o `.env` antes de iniciar o projeto.

---

**Última atualização**: 15 de Novembro de 2025
