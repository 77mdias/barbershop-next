# 🔐 Papéis e Permissões

Este documento explica o sistema de papéis e proteção de rotas na aplicação Barbershop Next.js.

---

## 1. Papéis de Usuário

- `CLIENT`: Cliente padrão, pode agendar serviços
- `BARBER`: Barbeiro, pode gerenciar sua agenda e disponibilidade
- `ADMIN`: Administrador, pode gerenciar usuários, serviços e relatórios

---

## 2. Controle de Acesso

- Proteção de rotas via middleware (`src/middleware.ts`)
- Server actions verificam o papel do usuário antes de executar operações sensíveis

---

## 3. Exemplos de Proteção

```typescript
// ...existing code...
if (session.user.role !== "ADMIN") {
  return { success: false, error: "Acesso negado" };
}
```

---

## 4. Boas Práticas
- Comentar regras de permissão nos arquivos relevantes
- Documentar fluxos de acesso e restrições
- Testar todos os cenários de acesso

---

## 5. Referências
- [Dashboard Admin](./dashboard-admin.md)
- [Dashboard Barbeiro](./dashboard-barber.md)
- [Testes de Fluxos](./test-flows.md)
