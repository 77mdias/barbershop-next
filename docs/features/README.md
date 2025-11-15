# ⚡ Features - Barbershop Next

Documentação detalhada de cada funcionalidade do sistema de agendamento de barbearia.

## 📚 Funcionalidades Principais

### 🗓️ Agendamentos e Serviços

- **[Appointment System](./appointment-system.md)** - Sistema completo de agendamentos
  - Criação e gestão de agendamentos
  - Status lifecycle: SCHEDULED → CONFIRMED → COMPLETED
  - Vinculação com barbeiros e serviços
  - Aplicação de vouchers e promoções
  - Dashboard do cliente e barbeiro

- **[Dashboard Admin](./dashboard-admin.md)** - Painel administrativo
  - Gestão de usuários e roles
  - CRUD completo de serviços
  - Análise de métricas e KPIs
  - Gestão de vouchers e promoções
  - Segurança com role validation (ADMIN only)

- **[Dashboard Barber](./dashboard-barber.md)** - Painel do barbeiro
  - Visualização de agendamentos
  - Histórico de atendimentos
  - Métricas de performance
  - Gestão de disponibilidade

### 💬 Social & Communication

- **[Chat System](./chat-system.md)** - Sistema de chat 1:1
  - Chat em tempo real entre amigos
  - Auto-refresh a cada 5 segundos
  - Contador de mensagens não lidas
  - Validação de amizade
  - Infinite scroll pagination
  - Mobile-first responsive design

- **[Notification System](./notification-system.md)** - Sistema completo de notificações
  - NotificationBell no header com dropdown
  - Auto-refresh a cada 30 segundos
  - Tipos: friend requests, invites, etc.
  - Mark as read (individual e bulk)
  - Página completa de notificações
  - Navegação contextual

- **[Notifications Overview](./notifications-overview.md)** - Visão geral do sistema
  - Arquitetura de notificações
  - Integração com features sociais
  - Padrões de implementação

### ⭐ Avaliações e Feedback

- **[Review System](./review-system.md)** - Sistema de avaliações
  - Reviews com rating (1-5 estrelas)
  - Upload de múltiplas imagens (até 5)
  - Vinculação com ServiceHistory
  - Listagem paginada de reviews
  - Edição de reviews existentes

- **[Gallery Component](./gallery-component.md)** - Componente de galeria
  - Lightbox para visualização de imagens
  - Navegação entre imagens
  - Responsive design
  - Lazy loading

- **[Gallery Integration](./gallery-integration.md)** - Exemplos de integração
  - Integração com reviews
  - Integração com perfis
  - Casos de uso práticos

### 📁 Upload e Storage

- **[Upload System](./upload-system.md)** - Sistema híbrido de upload
  - Local filesystem (development)
  - Cloudinary (production)
  - Rate limiting (10 uploads/hour)
  - Validação de tipos e tamanhos
  - API routes: /api/upload/profile, /api/upload/reviews
  - Suporte para profile images e review images

### 🎟️ Vouchers e Promoções

- **[Vouchers & Promotions](./vouchers-promotions.md)** - Sistema de vales e promoções
  - Tipos de vouchers: FREE_SERVICE, DISCOUNT_%, DISCOUNT_FIXED, CASHBACK
  - Tipos de promoções: DISCOUNT_%, DISCOUNT_FIXED, FREE_SERVICE, LOYALTY_BONUS
  - Promoções globais vs user-specific
  - Frequência mínima para loyalty rewards
  - Aplicação automática em appointments
  - Validação de elegibilidade

### 🎨 Temas e UI

- **[Theme System](./theme-system.md)** - Sistema de temas claro/escuro
  - ThemeProvider com context API
  - Detecção automática de OS theme
  - localStorage persistence
  - Anti-FOUC (Flash of Unstyled Content)
  - ThemeToggle animado no header
  - Suporte completo a dark mode

- **[Theme Impact Analysis](./theme-impact-analysis.md)** - Análise de impacto
  - Componentes afetados pelo theme
  - Variáveis CSS customizadas
  - Checklist de implementação

- **[Theme Deployment Fix](./theme-deployment-fix.md)** - Correções de deploy
  - Problemas conhecidos em produção
  - Soluções e workarounds
  - Hydration mismatch fixes

---

## 🎯 Status de Implementação

### ✅ Completamente Implementado

- ✅ Appointment System (agendamentos completos)
- ✅ Chat System (1:1 entre amigos)
- ✅ Notification System (completo com NotificationBell)
- ✅ Review System (com upload de imagens)
- ✅ Upload System (híbrido local + Cloudinary)
- ✅ Theme System (light/dark mode)
- ✅ Dashboard Admin (com CRUD de serviços)
- ✅ Dashboard Barber (métricas e agendamentos)
- ✅ Vouchers & Promotions (sistema completo)

### 🧪 Testado (100% passing)

- ✅ NotificationBell component
- ✅ ChatBell component
- ✅ MessageBubble component
- ✅ ReviewForm component
- ✅ LoadingSpinner component
- ✅ Skeleton component

---

## 🚀 Quick Reference

### Implementar Nova Feature

1. **Criar Server Actions** em `/src/server/`
2. **Criar Service Layer** em `/src/server/services/`
3. **Definir Zod Schemas** em `/src/schemas/`
4. **Criar Componentes UI** em `/src/components/`
5. **Adicionar Testes** em `/src/__tests__/`
6. **Documentar** em `/docs/features/`

### Padrão de Feature Documentation

```markdown
# Feature Name

## Overview
Breve descrição da feature

## Core Components
Lista de componentes principais

## Database Models
Modelos Prisma relacionados

## Server Actions
Actions disponíveis

## API Routes (se aplicável)
Endpoints da API

## Usage Examples
Exemplos de uso

## Integration Points
Onde a feature se conecta com outras

## Testing
Como testar a feature
```

---

## 📖 Leitura por Caso de Uso

### Implementar Agendamentos
1. [Appointment System](./appointment-system.md)
2. [Dashboard Barber](./dashboard-barber.md)
3. [Vouchers & Promotions](./vouchers-promotions.md)

### Implementar Social Features
1. [Chat System](./chat-system.md)
2. [Notification System](./notification-system.md)

### Implementar Reviews
1. [Review System](./review-system.md)
2. [Upload System](./upload-system.md)
3. [Gallery Component](./gallery-component.md)

### Customizar UI
1. [Theme System](./theme-system.md)
2. [Theme Impact Analysis](./theme-impact-analysis.md)

---

## 🔗 Links Relacionados

- [Architecture Documentation](../architecture/) - Padrões e arquitetura
- [Database Guide](../database/) - Modelos e queries
- [Testing Documentation](../testing/) - Guias de teste
- [Development Guide](../development/) - Processo de desenvolvimento

---

**Última atualização**: 15 de Novembro de 2025
