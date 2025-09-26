# 📘 Estudo do Modelo de Dados - Sistema de Barbearia

Este documento serve como um guia de estudo para compreender o modelo de dados do sistema de barbearia, com foco no sistema de vales, promoções e fidelidade.

## 📊 Visão Geral dos Modelos

O sistema é composto por 7 modelos principais que se relacionam para formar a estrutura completa:

1. **User** - Usuários do sistema (clientes e barbeiros)
2. **Service** - Serviços oferecidos pela barbearia
3. **Appointment** - Agendamentos de serviços
4. **ServiceHistory** - Histórico de serviços realizados
5. **Voucher** - Vales e benefícios de fidelidade
6. **Promotion** - Promoções disponíveis
7. **Tabelas de Relacionamento** - UserPromotion e PromotionService

## 🧠 Conceitos Estudados

### Enums no Prisma

Os enums são tipos especiais que limitam os valores possíveis para um campo:

```prisma
enum UserRole {
  CLIENT
  BARBER
  ADMIN
}
```

**Anotação de estudo:** Enums no Prisma são traduzidos para tipos ENUM no PostgreSQL, garantindo integridade dos dados diretamente no banco.

### Relacionamentos no Prisma

O Prisma oferece diferentes tipos de relacionamentos:

1. **Um para Muitos (1:N)**
   ```prisma
   // Um usuário pode ter muitos agendamentos
   user          User              @relation(fields: [userId], references: [id])
   ```

2. **Muitos para Muitos (N:N)**
   ```prisma
   // Implementado através de tabelas de junção como UserPromotion
   ```

3. **Relacionamentos Nomeados**
   ```prisma
   // Quando um modelo se relaciona com outro de múltiplas formas
   servicesProvided   Appointment[]    @relation("BarberAppointments")
   ```

**Anotação de estudo:** Relacionamentos nomeados são essenciais quando temos múltiplas relações entre os mesmos modelos (como User sendo cliente e barbeiro).

## 💻 Exemplos Práticos

### Modelo User

```prisma
model User {
  id            String         @id @default(cuid())
  name          String
  email         String         @unique
  phone         String?
  password      String?
  role          UserRole       @default(CLIENT)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relacionamentos
  appointments       Appointment[]    // Agendamentos feitos pelo usuário
  servicesProvided   Appointment[]    @relation("BarberAppointments") // Serviços prestados (para barbeiros)
  serviceHistory     ServiceHistory[] // Histórico de serviços recebidos
  vouchers           Voucher[]        // Vales/fidelidade do usuário
  promotions         UserPromotion[]  // Promoções personalizadas para o usuário
}
```

**Análise:**
- O modelo usa `cuid()` para gerar IDs únicos e seguros
- Campos opcionais são marcados com `?` (phone, password)
- Valores padrão são definidos com `@default`
- Timestamps automáticos com `@default(now())` e `@updatedAt`

## 📝 Exercícios de Compreensão

1. **Exercício:** Como você implementaria uma consulta para encontrar todos os vouchers ativos de um cliente?
   
   **Solução:**
   ```typescript
   const activeVouchers = await prisma.voucher.findMany({
     where: {
       userId: clientId,
       status: "ACTIVE",
       validUntil: {
         gte: new Date()
       }
     }
   });
   ```

2. **Exercício:** Como registrar que um cliente completou um serviço e ganhou um novo voucher após 5 cortes?
   
   **Solução:**
   ```typescript
   // Primeiro, conte quantos serviços o cliente já realizou
   const serviceCount = await prisma.serviceHistory.count({
     where: {
       userId: clientId,
       serviceId: hairCutServiceId
     }
   });
   
   // Se completou 5 serviços, crie um novo voucher
   if (serviceCount % 5 === 0) {
     await prisma.voucher.create({
       data: {
         code: `FREE-${clientId}-${Date.now()}`,
         type: "FREE_SERVICE",
         value: 0,
         minServices: 5,
         validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
         status: "ACTIVE",
         userId: clientId,
         serviceId: hairCutServiceId
       }
     });
   }
   ```

## 🚀 Próximos Passos de Estudo

1. Explorar consultas complexas com relacionamentos aninhados
2. Implementar regras de negócio para geração automática de vouchers
3. Estudar como implementar um sistema de notificação quando vouchers estão próximos de expirar

---

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs)
- [Guia de Relacionamentos no Prisma](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Melhores Práticas para Modelagem de Dados](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)