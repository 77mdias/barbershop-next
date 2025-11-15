# 📜 Regras de Negócio - Sistema de Barbearia

Este documento define as principais regras de negócio do sistema de barbearia, com foco no programa de fidelidade, vales e promoções.

## 🏆 Programa de Fidelidade

### Regra 1: Vale a cada 5 cortes
- **Descrição**: Cliente ganha um vale de serviço gratuito a cada 5 serviços do mesmo tipo realizados
- **Implementação**: Contagem automática via `ServiceHistory`
- **Validade**: 30 dias após a emissão

```typescript
// Pseudocódigo da regra
if (servicosRealizados % 5 === 0) {
  criarValeGratis(clienteId, servicoId);
}
```

### Regra 2: Expiração de Vales
- **Descrição**: Vales não utilizados expiram após o prazo de validade
- **Implementação**: Job diário para verificar e atualizar status
- **Ação**: Alterar status de `ACTIVE` para `EXPIRED`

## 🏷️ Promoções

### Regra 3: Promoção de Retorno
- **Descrição**: Cliente que não visita há mais de 30 dias recebe 10% de desconto
- **Implementação**: Verificação semanal de clientes inativos
- **Validade**: 15 dias após a emissão

### Regra 4: Promoção de Aniversário
- **Descrição**: Cliente recebe 15% de desconto no mês do aniversário
- **Implementação**: Verificação mensal de aniversariantes
- **Restrição**: Aplicável apenas uma vez no mês

### Regra 5: Promoção para Novos Serviços
- **Descrição**: 20% de desconto na primeira vez que um cliente experimenta um novo serviço
- **Implementação**: Verificação do histórico do cliente
- **Restrição**: Aplicável apenas para serviços que o cliente nunca utilizou

## 📅 Agendamentos

### Regra 6: Cancelamento
- **Descrição**: Cliente pode cancelar agendamento até 2 horas antes
- **Implementação**: Verificação de timestamp no momento do cancelamento
- **Penalidade**: Cancelamentos com menos de 2 horas não devolvem vouchers utilizados

### Regra 7: No-Show
- **Descrição**: Cliente que não comparece perde voucher utilizado (se houver)
- **Implementação**: Status `NO_SHOW` após 15 minutos do horário agendado
- **Penalidade**: Três no-shows em sequência bloqueiam agendamento online por 30 dias

## 👨‍💼 Barbeiros

### Regra 8: Comissão por Serviço
- **Descrição**: Barbeiros recebem comissão por serviço realizado
- **Implementação**: Cálculo baseado no `ServiceHistory`
- **Variação**: Comissão diferente para serviços com voucher/promoção

### Regra 9: Disponibilidade
- **Descrição**: Barbeiros definem horários disponíveis para agendamento
- **Implementação**: Tabela adicional para gerenciar disponibilidade
- **Restrição**: Agendamentos só podem ser feitos em horários disponíveis

## 🧪 Implementação das Regras

### Exemplo: Verificação de Elegibilidade para Vale

```typescript
// src/modules/voucher/services/voucherRules.ts
export async function checkVoucherEligibility(userId: string, serviceId: string) {
  // 1. Contar serviços realizados
  const serviceCount = await prisma.serviceHistory.count({
    where: {
      userId,
      serviceId
    }
  });
  
  // 2. Verificar se já tem vale ativo
  const hasActiveVoucher = await prisma.voucher.findFirst({
    where: {
      userId,
      serviceId,
      status: "ACTIVE"
    }
  });
  
  // 3. Aplicar regra de negócio
  const isEligible = serviceCount >= 5 && serviceCount % 5 === 0 && !hasActiveVoucher;
  
  return {
    isEligible,
    serviceCount,
    nextVoucherIn: isEligible ? 0 : 5 - (serviceCount % 5)
  };
}
```

### Exemplo: Aplicação de Promoção de Retorno

```typescript
// src/modules/promotion/services/inactiveClientPromotion.ts
export async function createReturnPromotions() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // 1. Encontrar clientes inativos
  const inactiveClients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      serviceHistory: {
        every: {
          completedAt: {
            lt: thirtyDaysAgo
          }
        }
      },
      // Garantir que não tem promoção ativa
      promotions: {
        none: {
          promotion: {
            type: "DISCOUNT_PERCENTAGE",
            name: "Volta com 10% OFF",
            active: true
          }
        }
      }
    }
  });
  
  // 2. Criar promoção para cada cliente
  for (const client of inactiveClients) {
    // Implementação da regra de negócio
    await createClientPromotion(client.id, "DISCOUNT_PERCENTAGE", 10.0);
  }
}
```

## 📝 Exercícios de Estudo

1. **Exercício**: Implemente a regra de negócio para promoção de aniversário.

2. **Exercício**: Crie a lógica para verificar e marcar no-shows automaticamente.

3. **Exercício**: Desenvolva a regra para calcular comissões de barbeiros considerando vouchers e promoções.