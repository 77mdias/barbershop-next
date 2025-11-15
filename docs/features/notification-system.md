# 🔔 Sistema de Notificações - Documentação Completa

## Visão Geral

O Sistema de Notificações foi implementado no **Sprint 1** para fornecer feedback em tempo real sobre interações sociais na plataforma. O sistema é composto por notificações automáticas, interface de usuário responsiva e gerenciamento completo de estado.

---

## 📊 Arquitetura do Sistema

### Componentes Principais

```
Sistema de Notificações
├── 🔧 Backend
│   ├── NotificationService (Service Layer)
│   ├── notificationActions.ts (Server Actions)
│   ├── Modelo Notification (Prisma)
│   └── Integração automática (friendshipActions.ts)
├── 🎨 Frontend
│   ├── NotificationBell (Componente Header)
│   ├── /profile/notifications (Página Completa)
│   └── UI Components (shadcn/ui)
└── 🗄️ Banco de Dados
    ├── Tabela notifications
    └── Seed com dados de exemplo
```

---

## 🗄️ Modelo de Dados

### Schema Prisma - Tabela `Notification`

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String   // Receptor da notificação
  type      NotificationType
  title     String   // Título da notificação
  message   String   // Mensagem detalhada
  read      Boolean  @default(false)
  relatedId String?  // ID relacionado (request, user, etc)
  metadata  Json?    // Dados adicionais (JSON)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

enum NotificationType {
  FRIEND_REQUEST_RECEIVED
  FRIEND_REQUEST_ACCEPTED
  FRIEND_REQUEST_REJECTED
  FRIEND_INVITE_USED
}
```

### Estrutura de Metadados

```typescript
// Exemplo de metadata para diferentes tipos
interface NotificationMetadata {
  // FRIEND_REQUEST_RECEIVED
  senderName?: string;
  senderId?: string;
  senderImage?: string;

  // FRIEND_REQUEST_ACCEPTED
  accepterName?: string;
  accepterId?: string;
  accepterImage?: string;

  // FRIEND_INVITE_USED
  newFriendName?: string;
  newFriendId?: string;
  newFriendImage?: string;
}
```

---

## 🔧 Backend - Service Layer

### NotificationService

**Localização**: `/src/server/services/notificationService.ts`

#### Métodos Principais

```typescript
class NotificationService {
  // Criar nova notificação
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    metadata?: any
  )

  // Buscar notificações recentes
  static async getRecentNotifications(userId: string, limit: number)

  // Contar notificações não lidas
  static async getUnreadCount(userId: string)

  // Marcar como lida
  static async markAsRead(notificationId: string, userId: string)

  // Marcar todas como lidas
  static async markAllAsRead(userId: string)

  // Deletar notificação
  static async deleteNotification(notificationId: string, userId: string)

  // Buscar com filtros
  static async getNotifications(userId: string, filters: NotificationFilters)
}
```

### Server Actions

**Localização**: `/src/server/notificationActions.ts`

#### Actions Disponíveis

```typescript
// Buscar notificações recentes (para dropdown)
export async function getRecentNotifications(limit: number = 5)

// Buscar todas as notificações (para página)
export async function getAllNotifications(page: number = 1, limit: number = 10)

// Buscar não lidas
export async function getUnreadNotifications(page: number = 1, limit: number = 10)

// Buscar lidas
export async function getReadNotifications(page: number = 1, limit: number = 10)

// Contar não lidas
export async function getUnreadCount()

// Marcar como lida
export async function markNotificationAsRead(notificationId: string)

// Marcar todas como lidas
export async function markAllNotificationsAsRead()

// Deletar notificação
export async function deleteNotification(notificationId: string)
```

---

## 🎨 Frontend - Interface de Usuário

### NotificationBell Component

**Localização**: `/src/components/NotificationBell.tsx`

#### Funcionalidades

- ✅ **Ícone Bell** com badge contador vermelho
- ✅ **Auto-refresh** a cada 30 segundos
- ✅ **Dropdown** com últimas 5 notificações
- ✅ **Navegação contextual** para páginas específicas
- ✅ **Marcar como lida** ao clicar
- ✅ **Animação pulse** quando há não lidas

#### Props e Estado

```typescript
interface NotificationBellState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
}
```

#### Ícones por Tipo

```typescript
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "FRIEND_REQUEST_RECEIVED":
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case "FRIEND_REQUEST_ACCEPTED":
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case "FRIEND_REQUEST_REJECTED":
      return <UserX className="h-4 w-4 text-red-500" />;
    case "FRIEND_INVITE_USED":
      return <Gift className="h-4 w-4 text-purple-500" />;
  }
};
```

### Página de Notificações

**Localização**: `/src/app/profile/notifications/page.tsx`

#### Funcionalidades Completas

- ✅ **Filtros por Tabs**: Todas, Não lidas, Lidas
- ✅ **Badges com contadores** em cada tab
- ✅ **Cards de notificação** com design responsivo
- ✅ **Dropdown "⋮"** com ações (Marcar como lida, Deletar)
- ✅ **Botões de ação contextuais** ("Ver solicitação", "Ver perfil")
- ✅ **Paginação** com "Carregar mais"
- ✅ **Loading skeletons** durante carregamento
- ✅ **Empty states** personalizados por filtro
- ✅ **Tempo relativo** humanizado (30m atrás, ontem, etc.)

#### Estados de Interface

```typescript
interface NotificationsPageState {
  notifications: Notification[];
  counts: { all: number; unread: number; read: number };
  activeTab: "all" | "unread" | "read";
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
}
```

---

## ⚡ Integração Automática

### Pontos de Criação Automática

O sistema cria notificações automaticamente em:

#### 1. **Solicitação de Amizade Enviada**
**Localização**: `friendshipActions.ts` → `sendFriendRequest()`

```typescript
await NotificationService.createNotification(
  receiverId,
  "FRIEND_REQUEST_RECEIVED",
  "Nova solicitação de amizade",
  `${senderName} enviou uma solicitação de amizade`,
  requestId,
  { senderName, senderId, senderImage }
);
```

#### 2. **Solicitação de Amizade Aceita**
**Localização**: `friendshipActions.ts` → `respondFriendRequest()`

```typescript
if (action === "ACCEPT") {
  await NotificationService.createNotification(
    senderId,
    "FRIEND_REQUEST_ACCEPTED",
    "Solicitação aceita!",
    `${accepterName} aceitou sua solicitação de amizade`,
    requestId,
    { accepterName, accepterId, accepterImage }
  );
}
```

#### 3. **Código de Convite Usado**
**Localização**: `friendshipActions.ts` → `acceptInvite()`

```typescript
await NotificationService.createNotification(
  inviterId,
  "FRIEND_INVITE_USED",
  "Seu código foi usado!",
  `${newFriendName} usou seu código de convite`,
  newFriendId,
  { newFriendName, newFriendId, newFriendImage }
);
```

---

## 🎯 Fluxos de Navegação

### Navegação Contextual por Tipo

```typescript
const getNavigationPath = (notification: Notification) => {
  switch (notification.type) {
    case "FRIEND_REQUEST_RECEIVED":
      return "/profile/social/requests"; // Ver solicitações pendentes
    
    case "FRIEND_REQUEST_ACCEPTED":
    case "FRIEND_INVITE_USED":
      return "/profile/social"; // Ver amigos/perfil social
    
    default:
      return "/profile/notifications"; // Página de notificações
  }
};
```

### Botões de Ação Contextuais

- **FRIEND_REQUEST_RECEIVED** → "Ver solicitação"
- **FRIEND_REQUEST_ACCEPTED** → "Ver perfil"
- **FRIEND_INVITE_USED** → "Ver amigo"

---

## 📱 Design Responsivo

### Desktop Layout
- Header com sino posicionado à direita
- Dropdown com 320px de largura
- Cards de notificação em layout completo

### Mobile Layout
- Sino no header mobile entre outros ícones
- Dropdown adaptado para telas menores
- Cards otimizados para touch

### Estados Visuais

#### Notificação Não Lida
```scss
background: bg-blue-50 border-blue-200
dark: bg-blue-950/30 border-blue-800
```

#### Notificação Lida
```scss
background: bg-background border-border
```

#### Badge Contador
```scss
badge: bg-destructive with animate-pulse
position: absolute -top-1 -right-1
```

---

## 🧪 Dados de Teste (Seed)

### Notificações de Exemplo Criadas

```typescript
// 6 notificações variadas para teste completo
const seedNotifications = [
  {
    type: "FRIEND_REQUEST_RECEIVED",
    userId: "carlos",
    read: false,
    createdAt: "agora"
  },
  {
    type: "FRIEND_REQUEST_ACCEPTED", 
    userId: "maria",
    read: false,
    createdAt: "1h atrás"
  },
  {
    type: "FRIEND_INVITE_USED",
    userId: "ana",
    read: true,
    createdAt: "1 dia atrás"
  },
  // ... mais exemplos com tempos variados
];
```

### Usuários de Teste

- **carlos@email.com** / `cliente123` (2 notificações não lidas)
- **maria@email.com** / `cliente123` (1 notificação não lida)
- **ana@email.com** / `cliente123` (1 notificação lida)

---

## 🔄 Performance e Otimizações

### Auto-refresh Inteligente
- **Intervalo**: 30 segundos
- **Cleanup**: useEffect cleanup para evitar memory leaks
- **Background**: Funciona apenas quando componente está montado

### Paginação Eficiente
- **Infinite scroll** com intersection observer (futuro)
- **Batch loading**: 10 notificações por página
- **Estado de loading** separado para "carregar mais"

### Cache e Estado
- **Estado local** otimizado com React hooks
- **Batch operations** para marcar múltiplas como lidas
- **Optimistic updates** para melhor UX

---

## 🚀 Expansões Futuras (Roadmap)

### Sprint 2 - Notificações em Tempo Real
- [ ] WebSocket/Server-Sent Events
- [ ] Push automático sem refresh
- [ ] Sincronização multi-tab

### Sprint 3 - Notificações Push
- [ ] Service Worker registration
- [ ] Push notifications no browser
- [ ] Configurações de permissão

### Sprint 4 - Email de Notificações
- [ ] Templates de email responsivos
- [ ] Configurações de frequência
- [ ] Digest diário/semanal

### Sprint 5 - Configurações Avançadas
- [ ] Preferências por tipo de notificação
- [ ] Horários de silêncio
- [ ] Configurações de som/vibração

---

## 🛠️ Guia de Desenvolvimento

### Adicionando Novo Tipo de Notificação

1. **Atualizar Enum no Prisma**:
```prisma
enum NotificationType {
  // ... existentes
  NEW_TYPE_NAME
}
```

2. **Migrar Database**:
```bash
docker compose exec app npx prisma migrate dev
```

3. **Adicionar Ícone no Frontend**:
```typescript
case "NEW_TYPE_NAME":
  return <NewIcon className="h-4 w-4 text-color-500" />;
```

4. **Integrar Criação Automática**:
```typescript
await NotificationService.createNotification(
  userId,
  "NEW_TYPE_NAME",
  "Título",
  "Mensagem",
  relatedId,
  metadata
);
```

### Debugging

#### Logs de Server Actions
```typescript
console.log("📧 Notification created:", { userId, type, title });
```

#### Verificar Estado no Browser
```javascript
// DevTools Console
localStorage.getItem('notifications-debug');
```

#### Database Queries
```sql
-- Verificar notificações de um usuário
SELECT * FROM notifications WHERE userId = 'user-id' ORDER BY createdAt DESC;

-- Contar não lidas
SELECT COUNT(*) FROM notifications WHERE userId = 'user-id' AND read = false;
```

---

## 📋 Checklist de Implementação

### ✅ Sprint 1 - Completado
- [x] NotificationService com CRUD completo
- [x] Server Actions para frontend
- [x] Modelo Prisma com relacionamentos
- [x] NotificationBell component responsivo
- [x] Página de notificações completa
- [x] Integração automática em friendshipActions
- [x] Seed com dados de teste
- [x] UI Components (popover, dropdown, etc.)
- [x] Navegação contextual
- [x] Estados de loading e empty states
- [x] Design system consistente

### 🔄 Em Desenvolvimento
- [ ] Notificações em tempo real (Sprint 2)
- [ ] Push notifications (Sprint 3)
- [ ] Email notifications (Sprint 4)
- [ ] Configurações avançadas (Sprint 5)

---

## 📞 Suporte e Manutenção

### Monitoramento
- **Logs**: Verificar logs de `notificationActions.ts`
- **Performance**: Monitorar queries de paginação
- **Uso**: Analytics de cliques no sino

### Troubleshooting Comum

#### Notificações não aparecem
1. Verificar autenticação do usuário
2. Verificar se `NotificationBell` está importado
3. Verificar logs de Server Actions

#### Badge não atualiza
1. Verificar auto-refresh (30s)
2. Verificar estado `unreadCount`
3. Force refresh manual

#### Paginação quebrada
1. Verificar `hasMore` state
2. Verificar query de paginação
3. Verificar loading states

---

**Sistema de Notificações v1.0 - Implementado em Sprint 1**  
*Documentação criada em: 27 de outubro de 2025*