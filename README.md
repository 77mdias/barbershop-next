# 💈 Barbershop Next.js App

Uma aplicação moderna para agendamento de serviços de barbearia, desenvolvida com **Next.js 14**, **TypeScript** e **Tailwind CSS**.

---

## 🚦 Fluxo Profissional de Deploy e Migrations (App vs Migrator)

**Este projeto segue o padrão profissional de separação entre imagem de produção (app) e migrator para máxima segurança e rastreabilidade.**

### Como funciona?
- **Imagem de produção (`app`)**: Só executa o código da aplicação e o Prisma Client já gerado. Não contém migrations nem schema do Prisma. Nunca altera o banco de dados.
- **Imagem migrator (`migrator`)**: Inclui a pasta `prisma/` com migrations e schema. Só é usada para rodar comandos administrativos (migrate deploy, db push, etc) e nunca serve requisições do app.

### Por que isso é importante?
- **Segurança**: O app nunca tem permissão de alterar o schema do banco em produção.
- **Controle**: Só quem faz build e executa o migrator pode alterar o banco, garantindo rastreabilidade e deploys auditáveis.
- **Performance**: Imagem de produção menor e mais rápida.

### Fluxo correto para migrations em produção
1. **Crie/atualize migrations localmente** (dev):
  ```bash
  docker compose exec app npx prisma migrate dev --name <nome-da-migration>
  ```
2. **Faça commit e push das migrations** para o repositório.
3. **Rebuild da imagem migrator** (sempre que houver nova migration!):
  ```bash
  docker compose -f docker-compose.pro.yml build migrator
  ```
4. **Aplique as migrations em produção**:
  ```bash
  ./scripts/deploy-pro.sh migrate
  # ou
  docker compose -f docker-compose.pro.yml --profile migration run --rm migrator
  ```
5. **Só depois** suba/reinicie o app de produção:
  ```bash
  ./scripts/deploy-pro.sh app-only
  ```

> **Nunca rode migrations pelo app de produção!**

Se as migrations não aparecem no banco de produção, sempre verifique se a imagem do migrator foi rebuildada após criar novas migrations.

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
- 🎯 **Performance otimizada** com Next.js 14
- 🌙 **Suporte a Dark Mode** (preparado)
- ⭐ **Sistema de Reviews** completo com avaliações e imagens
- 📊 **Dashboards Dinâmicos** com dados reais e métricas
- 🔔 **Sistema de Notificações** completo com real-time e histórico  
- 💀 **Loading States** e Skeleton Loaders para melhor UX
- 📸 **Sistema de Upload** funcional com processamento de imagens
- 👤 **Profile Management** com modal inline e upload de fotos
- 🔄 **Session Management** otimizado para updates em tempo real
- 🧪 **Testes Automatizados** com Jest e Testing Library

## 📸 Preview

A aplicação apresenta uma interface moderna e intuitiva para:

- 🏠 **Home**: Visão geral dos serviços e ofertas
- 🔍 **Busca**: Encontrar serviços e salões próximos
- 📅 **Agendamentos**: Sistema de reservas (em desenvolvimento)
- ⭐ **Reviews**: Sistema completo de avaliações com upload de imagens
- � **Notificações**: Sistema completo em tempo real com histórico
- �📊 **Dashboard**: Painéis personalizados por tipo de usuário
- 🖼️ **Galeria**: Galeria de trabalhos realizados
- 👤 **Perfil**: Gerenciamento completo com upload de fotos e modal inline
- ⚙️ **Configurações**: Interface moderna para edição de dados pessoais

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS Modules** - Estilização avançada para componentes
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js Server Actions** - API serverless
- **NextAuth.js** - Autenticação multi-provider
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Banco de dados relacional

### UI/UX
- **shadcn/ui** - Componentes base acessíveis
- **Radix UI** - Primitivos de UI
- **Lucide React** - Ícones modernos
- **Sonner** - Sistema de notificações toast
- **clsx + tailwind-merge** - Gerenciamento de classes

### Testes
- **Jest** - Framework de testes
- **Testing Library** - Testes de componentes React
- **ts-jest** - Suporte TypeScript para Jest

## 📦 Instalação e Uso

### Pré-requisitos

- Node.js 18+ 
- npm, yarn, pnpm ou bun

### Login Social e Sessão

O sistema suporta login via GitHub, Google e credenciais. Após rodar o seed, é necessário criar uma nova conta ou usar as contas de teste do seed. Se estiver logado com uma conta antiga, faça logout e registre novamente para evitar erros de sessão.

Contas de teste:
- Admin: `admin@barbershop.com` / senha: `admin123`
- Barbeiro: `joao@barbershop.com` / senha: `barbeiro123`
- Cliente: `carlos@email.com` / senha: `cliente123`

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/barbershop-next.git
cd barbershop-next
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

4. **Abra no navegador**
```
http://localhost:3000
```

## 🐳 Docker (Opcional)

Consulte também:
- [Guia Multi-Stage Docker](/docs/docker/GUIA-MULTI-STAGE.md)

### Método 1: Script Manager (Recomendado)
```bash
# Desenvolvimento completo
./scripts/docker-manager.sh up dev

# Prisma Studio
./scripts/docker-manager.sh studio dev
```

### Método 2: Docker Compose
```bash
# Desenvolvimento
docker compose up -d

# Produção
docker compose -f docker-compose.prod.yml up -d
```

### Targets Disponíveis
- `deps`: Base de dependências (cache otimizado)
- `dev`: Desenvolvimento com hot reload
- `builder`: Build de produção  
- `prod`: Imagem final de produção

> 📖 **Documentação completa:** [Docker Multi-Stage Guide](/docs/docker/GUIA-MULTI-STAGE.md)

## 📁 Estrutura do Projeto

Veja também:
- [Guia de Relacionamentos](/docs/guia-relacionamentos.md)
- [Fluxos de Vales e Fidelidade](/docs/fluxos-vales-fidelidade.md)
- [Sistema de Reviews](/docs/review-system.md)
- [Sistema de Upload](/docs/upload-system.md)

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css        # Estilos globais e tokens CSS
│   ├── layout.tsx         # Layout principal com Toaster
│   ├── page.tsx           # Página inicial
│   ├── dashboard/         # Dashboards personalizados
│   │   ├── page.tsx       # Dashboard principal (role-based)
│   │   └── barber/        # Dashboard específico para barbeiros
│   ├── reviews/           # Sistema de avaliações
│   └── api/               # API routes e upload
├── components/            # Componentes da aplicação
│   ├── ui/               # Componentes base reutilizáveis
│   │   ├── button.tsx    # Componente Button
│   │   ├── card.tsx      # Componente Card
│   │   ├── avatar.tsx    # Componente Avatar
│   │   ├── loading-spinner.tsx  # Spinner de carregamento
│   │   ├── skeleton.tsx  # Skeleton loader
│   │   ├── toast.tsx     # Sistema de toast
│   │   └── sonner.tsx    # Componente Sonner Toaster
│   ├── header.tsx        # Cabeçalho da aplicação
│   ├── NotificationBell.tsx # Sino de notificações em tempo real
│   ├── search-bar.tsx    # Barra de busca
│   ├── service-card.tsx  # Card de serviços
│   ├── offer-card.tsx    # Card de ofertas
│   ├── salon-card.tsx    # Card de salões
│   ├── ReviewForm.tsx    # Formulário de avaliações
│   ├── ReviewsList.tsx   # Lista de avaliações
│   ├── ReviewSection.tsx # Seção de reviews para dashboards
│   └── bottom-navigation.tsx # Navegação inferior
├── server/               # Server Actions
│   ├── reviewActions.ts  # Ações de reviews
│   ├── notificationActions.ts # Ações de notificações
│   ├── friendshipActions.ts   # Ações de amizades com notificações
│   └── dashboardActions.ts # Ações de dashboard e métricas
├── schemas/              # Schemas Zod de validação
│   ├── reviewSchemas.ts  # Validações de reviews
│   └── notificationSchemas.ts # Validações de notificações
├── lib/                  # Utilitários e configurações
│   ├── utils.ts          # Funções auxiliares
│   ├── auth.ts           # Configuração NextAuth
│   ├── prisma.ts         # Cliente Prisma
│   ├── upload.ts         # Configuração de upload
│   ├── NotificationService.ts # Serviço de notificações
│   └── rate-limit.ts     # Rate limiting
├── __tests__/            # Testes automatizados
│   ├── ReviewForm.test.tsx
│   ├── LoadingSpinner.test.tsx
│   └── Skeleton.test.tsx
├── styles/               # Estilos SCSS
│   └── components.module.scss # Estilos modulares
└── docs/                 # Documentação
    ├── development/      # Documentação de desenvolvimento
    ├── docker/           # Documentação Docker
    └── database/         # Documentação do banco de dados
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
npm run dev          # Inicia servidor de desenvolvimento
npm run test         # Executa testes com Jest

# Build
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção

# Qualidade de código
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript
npm run validate     # Lint + Type check

# Banco de Dados
npm run db:migrate   # Executa migrações
npm run db:push      # Push schema para banco
npm run db:studio    # Abre Prisma Studio
npm run db:seed      # Popula banco com dados de teste

# Docker (Desenvolvimento)
npm run docker:dev   # Inicia ambiente Docker
npm run docker:dev:shell    # Acessa shell do container
npm run docker:dev:migrate  # Migrações no Docker
npm run docker:dev:studio   # Prisma Studio no Docker
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

### ReviewForm
Formulário completo para criação e edição de avaliações com:
- Rating de 1-5 estrelas
- Upload de até 5 imagens
- Validação em tempo real
- Loading states

### ReviewsList
Lista paginada de avaliações com:
- Filtros por usuário, serviço e barbeiro
- Estatísticas (média, distribuição)
- Ações de edição e exclusão
- Visualização expandida de imagens

### Dashboard Components
- **DashboardLayout**: Layout base personalizado por role
- **ReviewSection**: Seção de reviews para dashboards
- **LoadingSpinner**: Spinner de carregamento reutilizável
- **Skeleton**: Componentes skeleton para estados de loading

## 🔔 Sistema de Notificações

O sistema de notificações fornece uma experiência completa em tempo real para interações sociais e eventos do sistema.

### 🚀 Funcionalidades

#### **NotificationBell Component**
Componente de header com notificações em tempo real:
- 🔄 **Auto-refresh** a cada 30 segundos
- 🔢 **Badge contador** para notificações não lidas
- 📱 **Dropdown interativo** com lista de notificações
- 🎯 **Navegação contextual** baseada no tipo de notificação
- 🎨 **Ícones dinâmicos** por categoria

#### **Página de Notificações (/profile/notifications)**
Interface completa de gerenciamento:
- 🏷️ **Filtros por categoria**: Todas, Amizades, Sistema, Agendamentos, Promoções
- ⚡ **Ações em lote**: Marcar como lida, excluir
- 📄 **Paginação** otimizada para grandes volumes
- 🎭 **Estados de loading** com skeletons
- 🔍 **Busca e ordenação** avançada

### 🛠️ Arquitetura Técnica

#### **NotificationService** (`/src/lib/NotificationService.ts`)
Serviço centralizado para operações CRUD:

```typescript
// Principais métodos
createNotification()          // Criar notificação
getRecentNotifications()      // Buscar recentes (header)
getNotifications()           // Buscar com paginação (página)
markAsRead()                 // Marcar como lida
markAllAsRead()              // Marcar todas como lidas
deleteNotification()         // Excluir notificação
getUnreadCount()            // Contar não lidas
```

#### **Server Actions** (`/src/server/notificationActions.ts`)
Actions para interação client-server:
- Validação com Zod schemas
- Tratamento de erros padronizado
- Integração com revalidação do Next.js

#### **Integração com Sistema Social**
Notificações automáticas em `friendshipActions.ts`:
- 👥 **Convites de amizade** enviados/recebidos
- ✅ **Aceite de convites**
- 📩 **Solicitações de conexão**

### 📊 Tipos de Notificação

| Tipo | Descrição | Ícone | Navegação |
|------|-----------|-------|-----------|
| `FRIENDSHIP_REQUEST` | Convite de amizade | UserPlus | `/profile/friends` |
| `FRIENDSHIP_ACCEPTED` | Convite aceito | Heart | `/profile/friends` |
| `APPOINTMENT_REMINDER` | Lembrete de agendamento | Calendar | `/profile/appointments` |
| `APPOINTMENT_CONFIRMED` | Agendamento confirmado | CheckCircle | `/profile/appointments` |
| `PROMOTION_AVAILABLE` | Nova promoção | Gift | `/promotions` |
| `SYSTEM_ANNOUNCEMENT` | Comunicado do sistema | Bell | `/notifications` |

### 🎯 Experiência do Usuário

#### **Feedback Visual**
- 🔴 **Badge vermelho** para notificações não lidas
- ⚪ **Estado "lida"** com opacidade reduzida  
- 🎨 **Ícones contextuais** por categoria
- ⏰ **Timestamps** humanizados (ex: "há 2 minutos")

#### **Interações Otimizadas**
- 👆 **Click no sino**: Abre dropdown com últimas 5 notificações
- 👆 **Click na notificação**: Navega para página relevante + marca como lida
- 👆 **"Ver todas"**: Redireciona para página completa
- ⚡ **Atualização automática**: Sem necessidade de refresh manual

## 🎯 Próximas Features

### ✅ Implementado Recentemente (Sprint 1 - Nov 2024)
- [x] **Sistema de Notificações Completo** - Real-time, histórico, filtros e ações
  - [x] NotificationBell component com auto-refresh
  - [x] Página completa de gerenciamento (/profile/notifications)
  - [x] NotificationService para operações CRUD
  - [x] Integração com sistema de amizades
  - [x] 6 tipos de notificação com navegação contextual
  - [x] Interface responsiva com loading states
- [x] Sistema de avaliações completo com upload de imagens
- [x] Dashboards diferenciados por role (Cliente, Barbeiro, Admin)  
- [x] Integração de dados reais nos dashboards
- [x] Sistema de notificações com Toaster (Sonner)
- [x] Loading states e skeleton loaders
- [x] Testes automatizados (Jest + Testing Library)
- [x] Server Actions para métricas e analytics

### Em Desenvolvimento
- [ ] Sistema de autenticação (NextAuth.js) - Integração completa
- [ ] Sistema de agendamentos - Finalização
- [ ] Pagamentos online (Stripe)

### Dashboard e Controle
- [x] Dashboard do Admin: gestão de usuários, serviços, relatórios
- [x] Dashboard do Barbeiro: agenda, disponibilidade, controle de agendamentos, métricas

### Planejado
- [ ] Notificações push
- [ ] Sistema de fidelidade
- [ ] Chat em tempo real
- [ ] Analytics avançados
- [ ] Exportação de relatórios

## 📚 Documentação

Consulte a pasta `docs/` para documentação detalhada:

### Infraestrutura
- [Docker e Ambiente](/docs/docker/README.md)
- [Setup Docker](/SETUP-DOCKER.md)
- [Next.js e TypeScript](/docs/nextjs/README.md)
- [Banco de Dados](/docs/database/README.md)
- [Prisma ORM](/docs/prisma/README.md)

### Features e Sistemas
- [Sistema de Notificações](/docs/notification-system.md) - Sistema completo em tempo real
- [Sistema de Reviews](/docs/review-system.md) - Sistema completo de avaliações
- [Sistema de Upload](/docs/upload-system.md) - Upload seguro de imagens
- [Dashboard Admin](/docs/dashboard-admin.md) - Painel administrativo
- [Dashboard Barbeiro](/docs/dashboard-barber.md) - Painel do barbeiro
- [Sistema de Agendamento](/docs/SISTEMA-AGENDAMENTO.md)

### Desenvolvimento
- [Roadmap](/docs/development/ROADMAP.md) - Planejamento e cronograma
- [Tasks](/docs/development/TASKS.md) - Tarefas e issues
- [Changelog](/docs/development/CHANGELOG.md) - Histórico de mudanças
- [Development Guide](/docs/development/README.md)

### Referências Técnicas
- [Exemplos de API](/docs/api-examples.md)
- [Papéis e Permissões](/docs/roles-permissions.md)
- [Testes de Fluxos](/docs/test-flows.md)
- [Regras de Negócio](/docs/regras-negocio.md)

### 🗄️ Guias de Banco de Dados

- **[📋 Guia Completo de Desenvolvimento](/docs/database/GUIA-DESENVOLVIMENTO.md)** - Melhores práticas, fluxos de trabalho e procedimentos para desenvolvimento de banco de dados
- **[🛠️ Exemplos Práticos](/docs/database/EXEMPLOS-PRATICOS.md)** - Cenários reais, casos de uso e resolução de problemas
- **[⚙️ Scripts de Banco](/docs/database/SCRIPTS.md)** - Documentação dos scripts npm para gerenciamento de banco de dados

## 📝 Licença

Este projeto está sob a licença MIT.

---
## ✅ Checklist para Colaboradores

- [ ] Ler o README e docs principais
- [ ] Seguir boas práticas de estudo e documentação
- [ ] Comentar funções e registrar decisões
- [ ] Criar todo-list antes de implementar features
- [ ] Sugerir múltiplas soluções para problemas
- [ ] Manter organização dos módulos e pastas
