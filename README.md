# 💈 Barbershop Next.js App

Uma aplicação moderna para agendamento de serviços de barbearia, desenvolvida com **Next.js 14**, **TypeScript** e **Tailwind CSS**.

---
## 📚 Recomendações de Estudo e Documentação

Este projeto segue as boas práticas do agente de IA para estudo e documentação:
- Documentação detalhada de cada processo e decisão
- Comentários explicativos em funções e componentes
- Todo-list para novas features e melhorias
- Sugestão de múltiplas soluções para problemas
- Organização clara em módulos e pastas
- Incentivo ao aprendizado contínuo

---

![Barbershop App](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Características

- ✨ **Design System** completo com tokens CSS customizados
- 📱 **Mobile-first** e totalmente responsivo
- 🎨 **Componentes reutilizáveis** baseados em shadcn/ui
- 🔧 **TypeScript** para type safety
- 🎯 **Performance otimizada** com Next.js 15
- 🔐 **Autenticação completa** com NextAuth.js (GitHub, Google, Credentials)
- 🗄️ **Database** PostgreSQL com Prisma ORM
- 🐳 **Docker** ambiente de desenvolvimento e produção
- ⭐ **Sistema de Reviews** completo com upload de imagens
- 📊 **Dashboards** personalizados por tipo de usuário
- 🌙 **Suporte a Dark Mode** (preparado)

## 📸 Preview

A aplicação apresenta uma interface moderna e intuitiva para:

- 🏠 **Home**: Visão geral dos serviços e ofertas
- 🔍 **Busca**: Encontrar serviços e salões próximos
- 📅 **Agendamentos**: Sistema completo de reservas
- 👤 **Perfil**: Gerenciamento de conta do usuário
- ⭐ **Reviews**: Sistema de avaliações com upload de fotos
- 📊 **Dashboard**: Painel personalizado para clientes e barbeiros

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **SCSS Modules** - Estilização avançada para componentes

### Backend & Database
- **Prisma ORM 6.17** - Type-safe database client
- **PostgreSQL** - Database relacional
- **NextAuth.js 4.24** - Autenticação completa
- **Zod 4.1** - Validação de schemas

### UI/UX
- **shadcn/ui** - Componentes base acessíveis
- **Radix UI** - Primitivos de UI
- **Lucide React** - Ícones modernos
- **clsx + tailwind-merge** - Gerenciamento de classes
- **React Hook Form 7.63** - Gerenciamento de formulários

### DevOps
- **Docker & Docker Compose** - Containerização
- **ESLint 9** - Linting
- **Nodemailer** - Sistema de emails

## 📦 Instalação e Uso

### Pré-requisitos

- **Docker 20.10+** e **Docker Compose 2.0+** (Recomendado)
- Ou **Node.js 20+** e **npm/yarn/pnpm/bun**
- **PostgreSQL 14+** (se não usar Docker)

### 🐳 Instalação com Docker (Recomendado)

Este projeto utiliza Docker como ambiente principal de desenvolvimento. Consulte o guia completo:
- 📖 [SETUP-DOCKER.md](./SETUP-DOCKER.md) - Guia completo de configuração
- 📖 [INSTALL.md](./INSTALL.md) - Instalação do Docker

```bash
# 1. Clone o repositório
git clone https://github.com/77mdias/barbershop-next.git
cd barbershop-next

# 2. Configure ambiente
cp .env.example .env.development
# Edite .env.development com suas configurações

# 3. Inicie com Docker
npm run docker:dev

# 4. Execute migrações e seed
npm run docker:dev:migrate
npm run docker:dev:seed

# 5. Acesse a aplicação
# http://localhost:3000
```

### Login Social e Sessão

O sistema suporta login via GitHub, Google e credenciais. Após rodar o seed, é necessário criar uma nova conta ou usar as contas de teste do seed. Se estiver logado com uma conta antiga, faça logout e registre novamente para evitar erros de sessão.

**Contas de teste**:
- Admin: `admin@barbershop.com` / senha: `admin123`
- Barbeiro: `joao@barbershop.com` / senha: `barbeiro123`
- Cliente: `carlos@email.com` / senha: `cliente123`

### 💻 Instalação Local (Sem Docker)

Se preferir desenvolvimento local sem Docker:

```bash
# 1. Clone o repositório
git clone https://github.com/77mdias/barbershop-next.git
cd barbershop-next

# 2. Instale as dependências
npm install

# 3. Configure ambiente
cp .env.example .env.development
# Configure DATABASE_URL e outras variáveis

# 4. Execute migrações
npm run db:migrate

# 5. Popule o banco (opcional)
npm run db:seed

# 6. Execute o servidor de desenvolvimento
npm run dev

# 7. Abra no navegador
# http://localhost:3000
```

⚠️ **Importante**: Você precisará de PostgreSQL rodando localmente ou em servidor remoto.

## 🐳 Docker - Comandos Principais

### Desenvolvimento

```bash
# Subir ambiente
npm run docker:dev

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

# Parar containers
npm run docker:dev:down
```

### Produção

```bash
# Deploy completo (migrações + aplicação)
./scripts/deploy-pro.sh deploy

# Ver logs
./scripts/deploy-pro.sh logs

# Status dos serviços
./scripts/deploy-pro.sh status
```

### Documentação Completa

- 📖 [SETUP-DOCKER.md](./SETUP-DOCKER.md) - Setup completo e checklist
- 📖 [DOCKER.md](./DOCKER.md) - Guia detalhado de uso
- 📖 [INSTALL.md](./INSTALL.md) - Instalação do Docker por distribuição
- 📖 [SECURITY.md](./SECURITY.md) - Considerações de segurança
- 📖 [/docs/docker/](./docs/docker/) - Documentação técnica detalhada

## 📁 Estrutura do Projeto

Veja também:
- [Guia de Relacionamentos](/docs/guia-relacionamentos.md)
- [Fluxos de Vales e Fidelidade](/docs/fluxos-vales-fidelidade.md)

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css        # Estilos globais e tokens CSS
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes da aplicação
│   ├── ui/               # Componentes base reutilizáveis
│   │   ├── button.tsx    # Componente Button
│   │   ├── card.tsx      # Componente Card
│   │   └── avatar.tsx    # Componente Avatar
│   ├── header.tsx        # Cabeçalho da aplicação
│   ├── search-bar.tsx    # Barra de busca
│   ├── service-card.tsx  # Card de serviços
│   ├── offer-card.tsx    # Card de ofertas
│   ├── salon-card.tsx    # Card de salões
│   └── bottom-navigation.tsx # Navegação inferior
├── lib/                  # Utilitários e configurações
│   └── utils.ts          # Funções auxiliares
├── styles/               # Estilos SCSS
│   └── components.module.scss # Estilos modulares
└── docs/                 # Documentação
    └── decisions.md      # Decisões técnicas
```

## 🎨 Design System

### Tokens de Cor

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 94%;
  --muted: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

### Componentes Base

- **Button**: 6 variantes (default, destructive, outline, secondary, ghost, link)
- **Card**: Container flexível com header, content e footer
- **Avatar**: Imagem de perfil com fallback para iniciais

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Inicia servidor de desenvolvimento
npm run build                  # Gera build de produção
npm run start                  # Inicia servidor de produção

# Qualidade de código
npm run lint                   # Executa ESLint
npm run lint:fix              # Corrige problemas automaticamente
npm run type-check            # Verifica tipos TypeScript
npm run validate              # Lint + Type check

# Database (Local)
npm run db:migrate            # Executa migrações
npm run db:push               # Push do schema para banco
npm run db:seed               # Popula banco com dados de teste
npm run db:studio             # Abre Prisma Studio
npm run db:reset              # Reset completo do banco

# Docker (Desenvolvimento)
npm run docker:dev            # Sobe containers de dev
npm run docker:dev:down       # Para containers
npm run docker:dev:logs       # Ver logs
npm run docker:dev:shell      # Acessa shell do container
npm run docker:dev:migrate    # Migrações no Docker
npm run docker:dev:seed       # Seed no Docker
npm run docker:dev:studio     # Prisma Studio no Docker

# Docker (Produção)
npm run docker:prod           # Sobe containers de prod
npm run docker:status         # Status de todos containers
npm run docker:clean          # Limpeza completa
```

## 📱 Responsividade

A aplicação foi desenvolvida com abordagem **mobile-first**:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

## 🧩 Componentes Principais

### ServiceCard
Card para exibir serviços disponíveis com ícone e estado ativo/inativo.

### SalonCard
Card para exibir informações de salões próximos com avaliações.

### OfferCard
Card para exibir ofertas especiais com desconto e período.

## 🎯 Status do Projeto

### ✅ Implementado (87.5% das Features Principais)

- ✅ **Sistema de autenticação** (NextAuth.js com GitHub, Google, Credentials)
- ✅ **Integração com banco de dados** (Prisma + PostgreSQL)
- ✅ **Sistema de agendamentos** completo
- ✅ **Dashboard do Cliente** com estatísticas e gestão de reviews
- ✅ **Dashboard do Barbeiro** com analytics e métricas
- ✅ **Sistema de Reviews** completo com upload de imagens
- ✅ **Sistema de Roles** (CLIENT, BARBER, ADMIN)
- ✅ **Sistema de Vouchers e Promoções**
- ✅ **Middleware de Proteção** de rotas
- ✅ **Docker** para desenvolvimento e produção

### 🚧 Em Desenvolvimento (Semana Atual)

- [ ] **Integração de dados reais** nos dashboards (70% - server actions ok)
- [ ] **Sistema de notificações** integrado (20%)
- [ ] **Loading states** e skeleton loaders (0%)
- [ ] **Testes automatizados** (5% - apenas manuais)

### 📋 Próximas Features

- [ ] **Pagamentos online** (Stripe/Mercado Pago)
- [ ] **Notificações push**
- [ ] **Sistema de fidelidade** avançado
- [ ] **Chat em tempo real**
- [ ] **Analytics avançados**
- [ ] **Sistema de busca** com filtros
- [ ] **PWA** capabilities
- [ ] **Dashboard Admin** completo

## 📚 Documentação

> **🚀 Início Rápido?** Veja [QUICK-START.md](./QUICK-START.md) para setup em 5 minutos!

### 📖 Documentação Essencial

| Documento | Descrição | Para Quem |
|-----------|-----------|-----------|
| **[QUICK-START.md](./QUICK-START.md)** ⚡ | Setup em 5 minutos | Todos |
| **[PROJECT-STATUS.md](./PROJECT-STATUS.md)** 📊 | Status completo do projeto | PO, Leads |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** 🤝 | Guia de contribuição | Devs |
| **[SETUP-DOCKER.md](./SETUP-DOCKER.md)** 🐳 | Setup Docker completo | Devs |
| **[DOCKER.md](./DOCKER.md)** 🐋 | Comandos Docker | Devs |
| **[INSTALL.md](./INSTALL.md)** 💻 | Instalação por OS | Devs |
| **[SECURITY.md](./SECURITY.md)** 🔒 | Considerações de segurança | Todos |
| **[CONFIGURAR-EMAIL.md](./CONFIGURAR-EMAIL.md)** 📧 | Setup de email | Devs |

### 🗂️ Documentação por Categoria

#### 🐳 Docker & DevOps
- **[DOCKER.md](./DOCKER.md)** - Guia detalhado de uso
- **[SETUP-DOCKER.md](./SETUP-DOCKER.md)** - Setup completo com checklist
- **[/docs/docker/README.md](./docs/docker/README.md)** - Overview completo
- **[/docs/docker/GUIA-MULTI-STAGE.md](./docs/docker/GUIA-MULTI-STAGE.md)** - Build multi-stage
- **[/docs/docker/PRODUCTION.md](./docs/docker/PRODUCTION.md)** - Deploy em produção
- **[/docs/docker/COMANDOS-RAPIDOS.md](./docs/docker/COMANDOS-RAPIDOS.md)** - Referência rápida

#### 🗄️ Database & Prisma
- **[/docs/database/GUIA-DESENVOLVIMENTO.md](./docs/database/GUIA-DESENVOLVIMENTO.md)** - Desenvolvimento com banco
- **[/docs/database/EXEMPLOS-PRATICOS.md](./docs/database/EXEMPLOS-PRATICOS.md)** - Casos de uso
- **[/docs/database/SCRIPTS.md](./docs/database/SCRIPTS.md)** - Scripts npm
- **[/docs/exemplos-consultas-prisma.md](./docs/exemplos-consultas-prisma.md)** - Queries Prisma
- **[/docs/estudo-modelo-dados.md](./docs/estudo-modelo-dados.md)** - Modelo de dados

#### 👥 Sistema & Features
- **[/docs/review-system.md](./docs/review-system.md)** - Sistema de reviews completo
- **[/docs/upload-system.md](./docs/upload-system.md)** - Upload de imagens
- **[/docs/roles-permissions.md](./docs/roles-permissions.md)** - Roles e permissões
- **[/docs/regras-negocio.md](./docs/regras-negocio.md)** - Regras de negócio
- **[/docs/fluxos-vales-fidelidade.md](./docs/fluxos-vales-fidelidade.md)** - Vouchers e fidelidade
- **[/docs/SISTEMA-AGENDAMENTO.md](./docs/SISTEMA-AGENDAMENTO.md)** - Sistema de agendamentos

#### 📊 Dashboards & API
- **[/docs/dashboard-admin.md](./docs/dashboard-admin.md)** - Dashboard Admin (planejado)
- **[/docs/dashboard-barber.md](./docs/dashboard-barber.md)** - Dashboard Barbeiro
- **[/docs/api-examples.md](./docs/api-examples.md)** - Exemplos de API
- **[/docs/test-flows.md](./docs/test-flows.md)** - Testes de fluxos

#### 🛠️ Desenvolvimento
- **[/docs/development/README.md](./docs/development/README.md)** - Overview de desenvolvimento
- **[/docs/development/ROADMAP.md](./docs/development/ROADMAP.md)** - Roadmap completo do projeto
- **[/docs/development/TASKS.md](./docs/development/TASKS.md)** - Tasks e issues atuais
- **[/docs/development/CHANGELOG.md](./docs/development/CHANGELOG.md)** - Histórico de mudanças

#### 📚 Guias de Estudo
- **[/docs/estudo/README.md](./docs/estudo/README.md)** - Index de guias
- **[/docs/estudo/01-prisma-conceitos-fundamentais.md](./docs/estudo/01-prisma-conceitos-fundamentais.md)** - Prisma
- **[/docs/estudo/02-docker-conceitos-fundamentais.md](./docs/estudo/02-docker-conceitos-fundamentais.md)** - Docker
- **[/docs/estudo/11-START-PROJECTS-DOCKER-GUIDE.md](./docs/estudo/11-START-PROJECTS-DOCKER-GUIDE.md)** - Guia completo
- **[E mais 7 guias...](./docs/estudo/)** - Conceitos fundamentais

---

### 🎯 Documentação por Persona

#### 👨‍💼 Para Product Owners
1. **[PROJECT-STATUS.md](./PROJECT-STATUS.md)** - Visão executiva completa
2. **[ROADMAP.md](./docs/development/ROADMAP.md)** - Planejamento e cronograma
3. **[TASKS.md](./docs/development/TASKS.md)** - Status das tasks

#### 👨‍💻 Para Desenvolvedores
1. **[QUICK-START.md](./QUICK-START.md)** - Setup em 5 minutos
2. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Como contribuir
3. **[SETUP-DOCKER.md](./SETUP-DOCKER.md)** - Ambiente de desenvolvimento
4. **[/docs/development/](./docs/development/)** - Documentação técnica

#### 🎨 Para Designers
1. **[README.md](./README.md)** - Overview do projeto
2. **Design System** - Documentação em desenvolvimento
3. **Componentes UI** - `/src/components/ui/`

#### 🔒 Para DevOps
1. **[SECURITY.md](./SECURITY.md)** - Segurança
2. **[/docs/docker/PRODUCTION.md](./docs/docker/PRODUCTION.md)** - Deploy
3. **[/docs/docker/](./docs/docker/)** - Docker avançado

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga as convenções de código do projeto
- Escreva testes para novas funcionalidades
- Atualize a documentação conforme necessário
- Siga o [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✅ Checklist para Colaboradores

- [ ] Ler o README e docs principais
- [ ] Seguir boas práticas de estudo e documentação
- [ ] Comentar funções e registrar decisões
- [ ] Criar todo-list antes de implementar features
- [ ] Sugerir múltiplas soluções para problemas
- [ ] Manter organização dos módulos e pastas
- [ ] Executar testes antes de submeter PR
- [ ] Atualizar documentação relevante

---

## 📞 Suporte e Contato

- 📧 **Issues**: [GitHub Issues](https://github.com/77mdias/barbershop-next/issues)
- 📖 **Documentação**: [/docs](/docs)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/77mdias/barbershop-next/discussions)

---

**Desenvolvido com ❤️ usando Next.js 15, TypeScript, Prisma e Docker**

**Status do Projeto**: 🚀 **Em desenvolvimento ativo - 87.5% das features principais implementadas**
