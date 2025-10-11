# 💈 Dashboard Barbeiro

Este documento detalha a estrutura, permissões e funcionalidades do painel do barbeiro.

---

## 1. Visão Geral

O dashboard do barbeiro permite:
- Visualizar agenda de agendamentos
- Definir disponibilidade de horários/dias
- Confirmar, cancelar e finalizar agendamentos
- Ver histórico de serviços e avaliações

---

## 2. Estrutura Recomendada

```
src/components/dashboard/BarberPanel.tsx
src/components/dashboard/AvailabilityCalendar.tsx
src/components/dashboard/AppointmentList.tsx
```

---

## 3. Permissões
- Apenas usuários com `role: BARBER` podem acessar
- Proteção via middleware e server actions

---

## 4. Funcionalidades
- Controle de disponibilidade (calendário interativo)
- Gestão de agendamentos (confirmar, cancelar, finalizar)
- Visualização de histórico e avaliações

---

## 5. Exemplo de Controle de Disponibilidade
```typescript
// ...existing code...
await db.barberAvailability.createMany({ data: slots });
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
