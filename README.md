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
- 🎯 **Performance otimizada** com Next.js 14
- 🌙 **Suporte a Dark Mode** (preparado)

## 📸 Preview

A aplicação apresenta uma interface moderna e intuitiva para:

- 🏠 **Home**: Visão geral dos serviços e ofertas
- 🔍 **Busca**: Encontrar serviços e salões próximos
- 📅 **Agendamentos**: Sistema de reservas (em desenvolvimento)
- 👤 **Perfil**: Gerenciamento de conta do usuário

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS Modules** - Estilização avançada para componentes

### UI/UX
- **shadcn/ui** - Componentes base acessíveis
- **Radix UI** - Primitivos de UI
- **Lucide React** - Ícones modernos
- **clsx + tailwind-merge** - Gerenciamento de classes

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
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção

# Qualidade de código
npm run lint         # Executa ESLint
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

## 🎯 Próximas Features

### Em Desenvolvimento
- [ ] Sistema de autenticação (NextAuth.js)
- [ ] Integração com banco de dados (Prisma)
- [ ] Sistema de agendamentos
- [ ] Pagamentos online (Stripe)

### Dashboard e Controle
- [ ] Dashboard do Admin: gestão de usuários, serviços, relatórios
- [ ] Dashboard do Barbeiro: agenda, disponibilidade, controle de agendamentos

### Planejado
- [ ] Notificações push
- [ ] Avaliações e comentários
- [ ] Sistema de fidelidade
- [ ] Chat em tempo real

## 📚 Documentação

Consulte a pasta `docs/` para documentação detalhada:

- [Docker e Ambiente](/docs/docker/README.md)
- [Next.js e TypeScript](/docs/nextjs/README.md)
- [Banco de Dados](/docs/database/README.md)
- [Prisma ORM](/docs/prisma/README.md)

- [Dashboard Admin](/docs/dashboard-admin.md)
- [Dashboard Barbeiro](/docs/dashboard-barber.md)
- [Exemplos de API](/docs/api-examples.md)
- [Papéis e Permissões](/docs/roles-permissions.md)
- [Testes de Fluxos](/docs/test-flows.md)

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
