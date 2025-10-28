# 💬 Sistema de Chat - Documentação Completa

## Visão Geral

O Sistema de Chat foi implementado como extensão do sistema social para permitir comunicação direta entre amigos na plataforma. O sistema é composto por mensagens em tempo real (polling), interface responsiva e gerenciamento completo de conversas.

---

## 📊 Arquitetura do Sistema

### Componentes Principais

```
Sistema de Chat
├── 🔧 Backend
│   ├── ChatService (Service Layer)
│   ├── chatActions.ts (Server Actions)
│   ├── Modelos Prisma (Conversation, ConversationParticipant, Message)
│   └── Integração com sistema de amizades
├── 🎨 Frontend
│   ├── ChatBell (Componente Header)
│   ├── ChatList (Lista de conversas)
│   ├── ChatWindow (Janela de chat)
│   ├── MessageBubble (Mensagem individual)
│   ├── MessageInput (Input de envio)
│   └── ConversationItem (Item da lista)
├── 📱 Páginas
│   ├── /chat (Lista de conversas)
│   └── /chat/[conversationId] (Conversa individual)
└── 🗄️ Banco de Dados
    ├── Tabelas (Conversation, ConversationParticipant, Message)
    └── Seed com dados de exemplo
```

---

## 🗄️ Modelo de Dados

### Schema Prisma

```prisma
model Conversation {
  id            String                    @id @default(cuid())
  createdAt     DateTime                  @default(now())
  updatedAt     DateTime                  @updatedAt
  lastMessageAt DateTime?
  participants  ConversationParticipant[]
  messages      Message[]

  @@index([lastMessageAt])
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  conversationId String
  userId         String
  lastReadAt     DateTime?
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
  @@index([userId])
}

model Message {
  id             String       @id @default(cuid())
  content        String       @db.Text
  conversationId String
  senderId       String
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@index([senderId])
}

// Relações adicionadas no User model:
model User {
  // ... campos existentes
  conversationParticipants ConversationParticipant[]
  messages                 Message[]
}
```

---

## 🔧 Backend - Service Layer

### ChatService

**Localização**: `/src/server/services/chatService.ts`

#### Métodos Principais

```typescript
class ChatService {
  // Gerenciamento de conversas
  static async getOrCreateConversation(userId1: string, userId2: string)
  static async getUserConversations(userId: string, filters?: Partial<ConversationFiltersInput>)
  static async getConversationById(conversationId: string, userId: string)

  // Mensagens
  static async sendMessage(conversationId: string, senderId: string, content: string)
  static async getMessages(conversationId: string, userId: string, page: number, limit: number)
  static async markMessagesAsRead(conversationId: string, userId: string)

  // Contadores
  static async getUnreadCount(userId: string)
  static async getUnreadCountPerConversation(conversationId: string, userId: string)

  // Validação
  static async isUserParticipant(conversationId: string, userId: string)
  static async areFriends(userId1: string, userId2: string)
  static async getChatStats(userId: string)
}
```

---

## 🎨 Frontend - Componentes

### ChatBell

**Localização**: `/src/components/ChatBell.tsx`

Componente de notificações de chat no header, similar ao NotificationBell.

**Features:**
- Badge com contador de mensagens não lidas
- Dropdown com preview das últimas 5 conversas
- Auto-refresh a cada 10 segundos
- Navegação direta para conversas

**Uso:**
```tsx
<ChatBell currentUserId={user.id} />
```

### ChatList

**Localização**: `/src/components/chat/ChatList.tsx`

Lista completa de todas as conversas do usuário.

**Features:**
- Busca/filtro por nome de amigo
- Preview da última mensagem
- Badge de não lidas por conversa
- Auto-refresh a cada 10 segundos
- Empty state com link para amigos

### ChatWindow

**Localização**: `/src/components/chat/ChatWindow.tsx`

Janela principal de chat com mensagens e input.

**Features:**
- Header com informações do amigo
- ScrollArea com histórico de mensagens
- Auto-scroll para última mensagem
- Paginação infinita (load more)
- Auto-refresh a cada 5 segundos
- Marca mensagens como lidas automaticamente
- Loading states

### MessageBubble

**Localização**: `/src/components/chat/MessageBubble.tsx`

Componente de mensagem individual.

**Features:**
- Diferenciação visual (enviado/recebido)
- Avatar do remetente
- Timestamp formatado
- Status de leitura (checkmarks)
- Quebra de linha preservada

### MessageInput

**Localização**: `/src/components/chat/MessageInput.tsx`

Input para enviar mensagens.

**Features:**
- Textarea com auto-resize
- Envio com Enter (Shift+Enter = nova linha)
- Validação de mensagens vazias
- Contador de caracteres (máx 5000)
- Loading state

---

## 📱 Páginas

### /chat

**Arquivo**: `/src/app/chat/page.tsx`

Página principal com lista de todas as conversas.

**Funcionalidades:**
- Exibe ChatList component
- Carrega conversas iniciais server-side
- Requer autenticação

### /chat/[conversationId]

**Arquivo**: `/src/app/chat/[conversationId]/page.tsx`

Página de conversa individual.

**Funcionalidades:**
- Exibe ChatWindow component
- Carrega mensagens iniciais server-side
- Valida participação na conversa
- 404 se conversa não existe

---

## 🔄 Real-Time Updates

O sistema utiliza **polling** para atualizações em tempo real:

- **ChatWindow**: Atualiza mensagens a cada **5 segundos**
- **ChatList**: Atualiza conversas a cada **10 segundos**
- **ChatBell**: Atualiza contador a cada **10 segundos**

**Por que polling?**
- Simplicidade de implementação
- Padrão consistente com o sistema de notificações
- Funciona em todos os ambientes (sem necessidade de WebSocket)
- Suficiente para casos de uso do sistema

---

## 🔐 Segurança

### Validações Implementadas

1. **Apenas amigos podem conversar**: Verificação no `getOrCreateConversation`
2. **Participação validada**: Todos os endpoints verificam se o usuário é participante
3. **Autenticação**: Todas as server actions verificam sessão
4. **Sanitização**: Conteúdo de mensagens é escapado no frontend
5. **Rate limiting**: Implementado no MessageInput (debounce)

### Validações Zod

**Arquivo**: `/src/schemas/chatSchemas.ts`

```typescript
SendMessageSchema      // Validação de envio de mensagem
GetMessagesSchema      // Paginação de mensagens
CreateConversationSchema // Criar conversa
MarkAsReadSchema       // Marcar como lida
ConversationFiltersSchema // Filtros de conversas
```

---

## 🎯 Fluxos Principais

### 1. Criar Conversa e Enviar Primeira Mensagem

```
User clica em MessageCircle (Social Page)
  ↓
handleOpenChat() chama getOrCreateConversation()
  ↓
ChatService verifica se são amigos
  ↓
Busca ou cria conversa
  ↓
Redireciona para /chat/[conversationId]
  ↓
ChatWindow carrega mensagens
  ↓
User digita e envia mensagem
  ↓
sendMessage() cria Message e atualiza lastMessageAt
```

### 2. Receber Mensagem

```
Auto-refresh (polling a cada 5s)
  ↓
getMessages() busca novas mensagens
  ↓
Atualiza estado local
  ↓
Auto-scroll para última mensagem
  ↓
markMessagesAsRead() marca como lidas
  ↓
Badge de não lidas atualiza (polling 10s)
```

---

## 🧪 Dados de Teste (Seed)

### Conversas Criadas

1. **Carlos ↔ Maria** (Clientes)
   - 5 mensagens
   - 1 não lida (Carlos → Maria)
   - Última mensagem: 30 min atrás

2. **Carlos ↔ João Barbeiro**
   - 4 mensagens
   - Todas lidas
   - Última mensagem: 1 dia atrás

3. **João ↔ Pedro** (Barbeiros)
   - 5 mensagens
   - 2 não lidas (Pedro → João)
   - Última mensagem: 50 min atrás

### Credenciais de Teste

```bash
# Cliente com conversas ativas
Email: carlos@email.com
Senha: cliente123

# Barbeiro com mensagens não lidas
Email: joao@barbershop.com
Senha: barbeiro123

# Cliente para conversar
Email: maria@email.com
Senha: cliente123
```

---

## 🚀 Como Testar

### 1. Executar Migration

```bash
docker compose exec app npx prisma migrate dev
```

### 2. Popular Banco de Dados

```bash
docker compose exec app npx prisma db seed
```

### 3. Testar Funcionalidades

#### Teste 1: Ver Conversas Existentes
1. Login com `carlos@email.com`
2. Clicar no ícone de chat no header
3. Verificar badge com contador de não lidas
4. Ver preview das conversas no dropdown

#### Teste 2: Enviar Mensagem
1. Clicar em uma conversa no dropdown
2. Verificar histórico de mensagens
3. Digitar nova mensagem
4. Enviar com Enter
5. Verificar auto-scroll

#### Teste 3: Receber Mensagem (Simular)
1. Login com `maria@email.com` em aba anônima
2. Abrir conversa com Carlos
3. Enviar mensagem
4. Na aba original (Carlos), aguardar 5s
5. Verificar nova mensagem aparecendo

#### Teste 4: Criar Nova Conversa
1. Login com usuário que tem amigos
2. Ir para /profile/social
3. Clicar no botão MessageCircle de um amigo
4. Verificar redirecionamento para nova conversa

---

## 📊 Métricas e Estatísticas

### getChatStats()

Retorna estatísticas do usuário:

```typescript
{
  totalConversations: number,  // Total de conversas
  unreadCount: number,          // Total de não lidas
  totalMessagesSent: number     // Total de mensagens enviadas
}
```

---

## 🔮 Melhorias Futuras

### Prioridade Alta

- [ ] **WebSocket/SSE**: Substituir polling por real-time verdadeiro
- [ ] **Indicador "digitando..."**: Mostrar quando o outro usuário está digitando
- [ ] **Push Notifications**: Notificações do navegador para novas mensagens

### Prioridade Média

- [ ] **Upload de imagens**: Permitir envio de fotos nas mensagens
- [ ] **Reações**: Adicionar reações emoji às mensagens
- [ ] **Busca no histórico**: Buscar mensagens antigas por palavra-chave
- [ ] **Deletar mensagens**: Permitir deletar mensagens enviadas

### Prioridade Baixa

- [ ] **Mensagens de voz**: Gravação e envio de áudio
- [ ] **Chat em grupo**: Conversas com 3+ pessoas
- [ ] **Chamadas de vídeo**: Integração com WebRTC
- [ ] **Arquivar conversas**: Ocultar conversas antigas

---

## 📝 Notas Técnicas

### Performance

- **Paginação**: 50 mensagens por página
- **Índices do banco**: Otimizados para queries frequentes
- **Auto-scroll**: Apenas em novas mensagens
- **Debounce**: Input não envia enquanto usuário digita

### Compatibilidade

- **Mobile-first**: Interface otimizada para mobile
- **Todos os navegadores**: Sem dependências específicas
- **Dark mode**: Suporte completo (via Tailwind)

### Limitações Conhecidas

1. **Polling vs WebSocket**:
   - Mensagens podem demorar até 5s para aparecer
   - Solução: Implementar WebSocket no futuro

2. **Tamanho de mensagem**:
   - Máximo 5000 caracteres
   - Solução: Aumentar limite ou implementar paginação

3. **Apenas 1:1**:
   - Não suporta grupos atualmente
   - Solução: Adicionar GroupConversation model

---

## 🐛 Troubleshooting

### Mensagens não aparecem

**Sintoma**: Mensagens enviadas não aparecem na conversa

**Possíveis causas:**
1. Polling desabilitado
2. Erro no auto-refresh
3. Sessão expirada

**Solução:**
- Verificar console do navegador
- Fazer hard refresh (Ctrl+Shift+R)
- Fazer logout e login novamente

### Badge de não lidas incorreto

**Sintoma**: Contador mostra número errado

**Possíveis causas:**
1. markMessagesAsRead não executou
2. Cache do navegador

**Solução:**
```sql
-- Verificar mensagens não lidas no banco
SELECT COUNT(*) FROM "Message"
WHERE "isRead" = false
AND "conversationId" IN (
  SELECT "conversationId" FROM "ConversationParticipant"
  WHERE "userId" = 'USER_ID_AQUI'
);
```

### Conversa não abre

**Sintoma**: 404 ao clicar em conversa

**Possíveis causas:**
1. Conversa foi deletada
2. Usuário não é participante

**Solução:**
- Verificar se usuário é amigo
- Verificar se conversação existe no banco

---

## 📚 Referências

- **Padrão utilizado**: Sistema de notificações (`docs/notification-system.md`)
- **Service Layer**: `friendshipService.ts`
- **Componentes base**: shadcn/ui (ScrollArea, Input, Button)
- **Formatação de datas**: date-fns

---

**Última atualização**: 28 de outubro de 2025
**Autor**: Claude AI (Sistema implementado em Sprint de Chat)
**Status**: ✅ **Sistema completo e funcional**
