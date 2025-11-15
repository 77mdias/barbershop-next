# 🔄 Guia de Relacionamentos - Sistema de Barbearia

---
## ✅ Recomendações do Agente de Estudo

- Documentar cada consulta e relacionamento importante
- Comentar funções e exemplos de queries
- Criar todo-list para novas features de relacionamento
- Registrar aprendizados e problemas encontrados
- Consultar docs detalhadas:
  - [Dashboard Admin](./dashboard-admin.md)
  - [Dashboard Barbeiro](./dashboard-barber.md)
  - [Papéis e Permissões](./roles-permissions.md)
  - [Testes de Fluxos](./test-flows.md)
  - [Exemplos de API](./api-examples.md)

---

Este guia visual explica como as entidades do sistema de barbearia se relacionam entre si, facilitando a compreensão da arquitetura de dados.

## 📊 Diagrama de Relacionamentos

```
┌─────────┐       ┌─────────────┐       ┌─────────┐
│   User  │◄──────┤ Appointment │◄──────┤ Service │
└────┬────┘       └──────┬──────┘       └────┬────┘
     │                   │                   │
     │                   │                   │
     ▼                   ▼                   ▼
┌─────────┐       ┌─────────────┐      ┌──────────┐
│ Voucher │       │ServiceHistory│      │ Promotion│
└─────────┘       └─────────────┘      └────┬─────┘
                                            │
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │UserPromotion │
                                     └──────────────┘
```

## 🔍 Principais Relacionamentos

### 1. User ↔️ Appointment

```prisma
// No modelo User
appointments       Appointment[]    // Agendamentos feitos pelo usuário
servicesProvided   Appointment[]    @relation("BarberAppointments") // Serviços prestados (para barbeiros)

// No modelo Appointment
userId        String
user          User              @relation(fields: [userId], references: [id])
barberId      String
barber        User              @relation("BarberAppointments", fields: [barberId], references: [id])
```

**Explicação:** Um usuário pode ter múltiplos agendamentos (como cliente) e também pode fornecer múltiplos serviços (como barbeiro). Este é um exemplo de relacionamento duplo entre as mesmas entidades.

### 2. Appointment ↔️ Service

```prisma
// No modelo Appointment
serviceId     String
service       Service           @relation(fields: [serviceId], references: [id])

// No modelo Service
appointments      Appointment[]     // Agendamentos para este serviço
```

**Explicação:** Um agendamento está sempre associado a um serviço específico, enquanto um serviço pode estar em múltiplos agendamentos.

### 3. User ↔️ Voucher

```prisma
// No modelo User
vouchers           Voucher[]        // Vales/fidelidade do usuário

// No modelo Voucher
userId        String
user          User           @relation(fields: [userId], references: [id])
```

**Explicação:** Um usuário pode ter múltiplos vouchers (vales de desconto, serviços gratuitos, etc.).

### 4. Promotion ↔️ User (via UserPromotion)

```prisma
// No modelo User
promotions         UserPromotion[]  // Promoções personalizadas para o usuário

// No modelo Promotion
userPromotions    UserPromotion[]     // Usuários que recebem esta promoção

// Tabela de junção
model UserPromotion {
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  promotionId   String
  promotion     Promotion  @relation(fields: [promotionId], references: [id])
  @@unique([userId, promotionId])
}
```

**Explicação:** Este é um relacionamento muitos-para-muitos (N:N) entre User e Promotion, implementado através da tabela de junção UserPromotion.

## 💡 Dicas para Consultas

### Consulta com Múltiplos Níveis de Relacionamento

Para buscar um usuário com seus agendamentos e serviços:

```typescript
const userWithAppointments = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    appointments: {
      include: {
        service: true,
        voucher: true
      }
    }
  }
});
```

### Consulta com Filtros em Relacionamentos

Para buscar barbeiros que oferecem um serviço específico:

```typescript
const barbersForService = await prisma.user.findMany({
  where: {
    role: "BARBER",
    servicesProvided: {
      some: {
        serviceId: specificServiceId
      }
    }
  }
});
```

## 🧪 Exercício Prático

### Todo-list para Consultas Avançadas
- [ ] Consulta de clientes com vouchers ativos
- [ ] Consulta de barbeiros por serviço
- [ ] Consulta de agendamentos por status

**Desafio:** Escreva uma consulta para encontrar todos os clientes que têm vouchers ativos para um serviço específico.

**Solução:**
```typescript
const clientsWithActiveVouchers = await prisma.user.findMany({
  where: {
    role: "CLIENT",
    vouchers: {
      some: {
        status: "ACTIVE",
        serviceId: specificServiceId,
        validUntil: {
          gte: new Date()
        }
      }
    }
  },
  include: {
    vouchers: {
      where: {
        status: "ACTIVE",
        serviceId: specificServiceId
      }
    }
  }
});
```

## 📝 Anotações de Estudo

- Sempre comentar consultas complexas
- Registrar aprendizados sobre constraints e relacionamentos

- Os relacionamentos no Prisma são bidirecionais, definidos em ambos os lados
- Relacionamentos nomeados (como `@relation("BarberAppointments")`) são usados quando há múltiplas relações entre os mesmos modelos
- A constraint `@@unique` é usada para garantir que não haja duplicatas em relacionamentos N:N