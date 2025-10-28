# 🚀 Setup do Sistema de Chat

## Visão Geral

Este documento contém as instruções para aplicar as mudanças do sistema de chat no ambiente Docker.

---

## ⚠️ IMPORTANTE: Projeto 100% Containerizado

Todos os comandos devem ser executados dentro do container Docker usando `docker compose exec app <comando>`.

---

## 📋 Pré-requisitos

1. Docker e Docker Compose instalados
2. Containers rodando (`docker compose up -d`)
3. Acesso ao banco de dados PostgreSQL

---

## 🔄 Passo a Passo

### 1. Garantir que os containers estão rodando

```bash
docker compose up -d
docker compose ps  # Verificar status
```

### 2. Aplicar a migration do banco de dados

```bash
docker compose exec app npx prisma migrate dev --name add_chat_system
```

**O que a migration faz:**
- Cria tabela `Conversation`
- Cria tabela `ConversationParticipant`
- Cria tabela `Message`
- Adiciona relações no model `User`
- Cria índices para performance

### 3. Gerar Prisma Client

```bash
docker compose exec app npx prisma generate
```

### 4. Popular banco com dados de teste

```bash
docker compose exec app npx prisma db seed
```

**Dados criados:**
- 3 conversas entre usuários amigos
- ~14 mensagens distribuídas
- Algumas mensagens não lidas para testar badges

### 5. Reiniciar o servidor de desenvolvimento

```bash
docker compose restart app
docker compose logs -f app  # Ver logs
```

---

## 🧪 Testar o Sistema

### Acesse a aplicação

```
http://localhost:3000
```

### Credenciais de Teste

**Cliente com conversas ativas:**
```
Email: carlos@email.com
Senha: cliente123
```

**Barbeiro com mensagens não lidas:**
```
Email: joao@barbershop.com
Senha: barbeiro123
```

**Outro cliente:**
```
Email: maria@email.com
Senha: cliente123
```

### Funcionalidades para testar

1. ✅ **ChatBell no Header**
   - Ver badge com contador
   - Abrir dropdown
   - Preview das conversas

2. ✅ **Lista de Conversas** (`/chat`)
   - Ver todas as conversas
   - Buscar por nome
   - Contadores de não lidas

3. ✅ **Janela de Chat** (`/chat/[id]`)
   - Ver histórico de mensagens
   - Enviar nova mensagem
   - Auto-scroll
   - Auto-refresh (5s)

4. ✅ **Botão MessageCircle** (`/profile/social`)
   - Criar nova conversa com amigo
   - Abrir chat existente

---

## 🔧 Comandos Úteis

### Ver conversas no banco

```bash
docker compose exec app npx prisma studio
```

Depois acesse: `http://localhost:5555`

### Reset completo do banco (⚠️ CUIDADO - Apaga tudo!)

```bash
docker compose exec app npx prisma migrate reset
```

### Verificar status das migrations

```bash
docker compose exec app npx prisma migrate status
```

---

## 📦 Arquivos Criados/Modificados

### Novos Arquivos

**Backend:**
- `/src/schemas/chatSchemas.ts`
- `/src/server/services/chatService.ts`
- `/src/server/chatActions.ts`

**Componentes:**
- `/src/components/ChatBell.tsx`
- `/src/components/chat/MessageBubble.tsx`
- `/src/components/chat/MessageInput.tsx`
- `/src/components/chat/ConversationItem.tsx`
- `/src/components/chat/ChatWindow.tsx`
- `/src/components/chat/ChatList.tsx`

**Páginas:**
- `/src/app/chat/page.tsx`
- `/src/app/chat/[conversationId]/page.tsx`

**Documentação:**
- `/docs/chat-system.md`
- `/CHAT_SETUP.md` (este arquivo)

### Arquivos Modificados

- `prisma/schema.prisma` - Adicionados 3 models (Conversation, ConversationParticipant, Message)
- `prisma/seed.ts` - Adicionadas conversas e mensagens de teste
- `/src/components/HeaderNavigation.tsx` - Integrado ChatBell
- `/src/app/profile/social/page.tsx` - Habilitado botão MessageCircle

---

## 🐛 Troubleshooting

### Erro: "Prisma Client not generated"

```bash
docker compose exec app npx prisma generate
docker compose restart app
```

### Erro: "Cannot find module @/schemas/chatSchemas"

Verifique se o TypeScript foi compilado:

```bash
docker compose exec app npm run type-check
```

### Migration falha

Se a migration falhar, você pode:

1. Reverter migration:
```bash
docker compose exec app npx prisma migrate reset
```

2. Aplicar novamente:
```bash
docker compose exec app npx prisma migrate dev --name add_chat_system
```

### Chat não aparece no header

1. Fazer logout e login novamente
2. Limpar cache do navegador (Ctrl+Shift+R)
3. Verificar se está autenticado

---

## 📊 Estrutura do Banco

```
Conversation
├── id (String)
├── createdAt (DateTime)
├── updatedAt (DateTime)
├── lastMessageAt (DateTime?)
├── participants (ConversationParticipant[])
└── messages (Message[])

ConversationParticipant
├── id (String)
├── conversationId (String) → Conversation
├── userId (String) → User
├── lastReadAt (DateTime?)
└── createdAt (DateTime)

Message
├── id (String)
├── content (Text)
├── conversationId (String) → Conversation
├── senderId (String) → User
├── isRead (Boolean)
├── createdAt (DateTime)
└── updatedAt (DateTime)

User
├── ... (campos existentes)
├── conversationParticipants (ConversationParticipant[])
└── messages (Message[])
```

---

## 🎯 Features Implementadas

✅ Sistema completo de chat 1:1
✅ ChatBell com contador no header
✅ Lista de conversas com busca
✅ Janela de chat com histórico
✅ Envio e recebimento de mensagens
✅ Marcação de mensagens como lidas
✅ Auto-refresh (polling)
✅ Integração com sistema social
✅ Validação de amizade
✅ Mobile-first design
✅ Seed com dados de teste
✅ Documentação completa

---

## 📚 Documentação Adicional

Para mais detalhes sobre o sistema, consulte:

- **Documentação completa**: `/docs/chat-system.md`
- **Documentação do projeto**: `/CLAUDE.md`
- **Sistema social**: Documentado no CLAUDE.md
- **Sistema de notificações**: `/docs/notification-system.md`

---

## ✅ Checklist de Instalação

- [ ] Containers rodando
- [ ] Migration aplicada
- [ ] Prisma Client gerado
- [ ] Seed executado
- [ ] Servidor reiniciado
- [ ] Testado login
- [ ] ChatBell aparece no header
- [ ] Conversas carregam
- [ ] Mensagens enviam/recebem
- [ ] Botão MessageCircle funciona

---

**Data**: 28 de outubro de 2025
**Branch**: `claude/chat-system-011CUZS1KqoyexKJFTUR9MRY`
**Status**: ✅ Pronto para uso
