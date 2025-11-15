# 📡 Exemplos de API

Este documento apresenta exemplos de requisições e respostas dos principais endpoints da aplicação.

---

## 1. Listar Barbeiros

**GET** `/api/barbers`
```json
[
  {
    "id": "...",
    "name": "João Barbeiro",
    "email": "joao@barbershop.com",
    "image": null,
    "phone": "11988888888"
  }
]
```

---

## 2. Criar Agendamento

**POST** `/api/appointments`
```json
{
  "serviceId": "...",
  "barberId": "...",
  "date": "2025-10-15T14:00:00.000Z",
  "notes": "Primeira vez nesta barbearia"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": { /* dados do agendamento */ }
}
```

---

## 3. Cancelar Agendamento

**PATCH** `/api/appointments/{id}/cancel`
```json
{
  "reason": "Cliente não pode comparecer"
}
```

**Resposta:**
```json
{
  "success": true
}
```

---

## 4. Consultar Disponibilidade

**GET** `/api/barbers?serviceId=...&date=...`
```json
[
  {
    "id": "...",
    "name": "João Barbeiro",
    "availability": {
      "percentage": 80,
      "appointmentsCount": 2,
      "hasAvailability": true
    }
  }
]
```

---

## 5. Referências
- [Dashboard Admin](./dashboard-admin.md)
- [Dashboard Barbeiro](./dashboard-barber.md)
