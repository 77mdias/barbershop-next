# 🛠️ Dashboard Admin

Este documento detalha a estrutura, permissões e exemplos de uso do painel administrativo do Barbershop Next.js.

---

## 1. Visão Geral

O dashboard do admin permite:
- Gerenciar usuários (clientes, barbeiros, admins)
- Gerenciar serviços e promoções
- Visualizar estatísticas e relatórios
- Controlar agendamentos e status

---

## 2. Estrutura Recomendada

```
src/components/dashboard/AdminPanel.tsx
src/components/dashboard/UserTable.tsx
src/components/dashboard/ServiceManager.tsx
src/components/dashboard/ReportCard.tsx
```

---

## 3. Permissões

- Apenas usuários com `role: ADMIN` podem acessar
- Proteção via middleware e server actions

---

## 4. Funcionalidades

- CRUD de usuários e serviços
- Ativação/desativação de contas
- Criação de promoções/vouchers
- Exportação de relatórios
- Visualização de agendamentos e status

---

## 5. Exemplos de Uso

### Exemplo: Listar Usuários
```typescript
// ...existing code...
const users = await db.user.findMany({});
```

### Exemplo: Criar Serviço
```typescript
// ...existing code...
await db.service.create({ data: { name: "Corte", price: 50 } });
```

---

## 6. Boas Práticas
- Comentar funções e componentes
- Registrar decisões e fluxos no docs
- Criar todo-list antes de implementar novas features

---

## 7. Referências
- [Papéis e Permissões](./roles-permissions.md)
- [Testes de Fluxos](./test-flows.md)
