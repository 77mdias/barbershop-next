# 🔍 Exemplos Práticos de Consultas Prisma - Sistema de Barbearia

Este documento contém exemplos práticos de consultas Prisma para o sistema de barbearia, focando nos casos de uso mais comuns.

## 📊 Consultas Básicas

### 1. Buscar Todos os Barbeiros Disponíveis

```typescript
// src/modules/user/services/barberService.ts
export async function getAvailableBarbers() {
  return prisma.user.findMany({
    where: {
      role: "BARBER",
      // Adicione outros filtros conforme necessário
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true
    }
  });
}
```

### 2. Buscar Serviços Disponíveis

```typescript
// src/modules/service/services/serviceService.ts
export async function getActiveServices() {
  return prisma.service.findMany({
    where: {
      active: true
    },
    orderBy: {
      price: 'asc'
    }
  });
}
```

## 📊 Consultas com Relacionamentos

### 3. Buscar Agendamentos de um Cliente com Detalhes

```typescript
// src/modules/appointment/services/appointmentService.ts
export async function getClientAppointments(clientId: string) {
  return prisma.appointment.findMany({
    where: {
      userId: clientId
    },
    include: {
      service: true,
      barber: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      voucher: true
    },
    orderBy: {
      date: 'desc'
    }
  });
}
```

### 4. Buscar Histórico de Serviços com Avaliações

```typescript
// src/modules/serviceHistory/services/historyService.ts
export async function getServiceHistoryWithRatings(barberId: string) {
  return prisma.serviceHistory.findMany({
    where: {
      appointments: {
        some: {
          barberId
        }
      },
      rating: {
        not: null
      }
    },
    include: {
      user: {
        select: {
          name: true
        }
      },
      service: true
    },
    orderBy: {
      completedAt: 'desc'
    }
  });
}
```

## 📊 Consultas para o Sistema de Vales

### 5. Buscar Vales Ativos de um Cliente

```typescript
// src/modules/voucher/services/voucherService.ts
export async function getActiveVouchers(userId: string) {
  const now = new Date();
  
  return prisma.voucher.findMany({
    where: {
      userId,
      status: "ACTIVE",
      validUntil: {
        gte: now
      }
    },
    include: {
      service: true
    }
  });
}
```

### 6. Verificar Elegibilidade para Novo Vale

```typescript
// src/modules/voucher/services/voucherEligibilityService.ts
export async function checkVoucherEligibility(userId: string, serviceId: string) {
  // Contar quantos serviços o cliente já realizou
  const serviceCount = await prisma.serviceHistory.count({
    where: {
      userId,
      serviceId
    }
  });
  
  // Verificar se já existe um vale ativo para este serviço
  const existingVoucher = await prisma.voucher.findFirst({
    where: {
      userId,
      serviceId,
      status: "ACTIVE"
    }
  });
  
  return {
    serviceCount,
    isEligible: serviceCount >= 5 && !existingVoucher,
    nextVoucherIn: existingVoucher ? null : 5 - (serviceCount % 5)
  };
}
```

## 📊 Consultas para Promoções

### 7. Buscar Promoções Disponíveis para um Cliente

```typescript
// src/modules/promotion/services/promotionService.ts
export async function getAvailablePromotions(userId: string) {
  const now = new Date();
  
  return prisma.promotion.findMany({
    where: {
      OR: [
        // Promoções globais
        {
          isGlobal: true,
          active: true,
          validFrom: { lte: now },
          validUntil: { gte: now }
        },
        // Promoções específicas para o usuário
        {
          isGlobal: false,
          active: true,
          validFrom: { lte: now },
          validUntil: { gte: now },
          userPromotions: {
            some: {
              userId
            }
          }
        }
      ]
    },
    include: {
      servicePromotions: {
        include: {
          service: true
        }
      }
    }
  });
}
```

## 📊 Consultas Avançadas

### 8. Dashboard de Desempenho de Barbeiros

```typescript
// src/modules/dashboard/services/barberPerformanceService.ts
export async function getBarberPerformance(barberId: string, startDate: Date, endDate: Date) {
  // Total de serviços realizados
  const totalServices = await prisma.appointment.count({
    where: {
      barberId,
      status: "COMPLETED",
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  // Avaliação média
  const ratings = await prisma.serviceHistory.aggregate({
    where: {
      appointments: {
        some: {
          barberId,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      rating: {
        not: null
      }
    },
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    }
  });
  
  // Serviços mais realizados
  const topServices = await prisma.service.findMany({
    where: {
      appointments: {
        some: {
          barberId,
          status: "COMPLETED",
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          appointments: {
            where: {
              barberId,
              status: "COMPLETED",
              date: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      }
    },
    orderBy: {
      appointments: {
        _count: 'desc'
      }
    },
    take: 5
  });
  
  return {
    totalServices,
    averageRating: ratings._avg.rating || 0,
    ratingCount: ratings._count.rating || 0,
    topServices
  };
}
```

## 📝 Exercícios Práticos

1. **Exercício:** Implemente uma consulta para encontrar clientes que não visitam a barbearia há mais de 60 dias.

2. **Exercício:** Crie uma consulta para listar os vouchers que expirarão nos próximos 7 dias.

3. **Exercício:** Implemente uma função para calcular a receita total gerada por um barbeiro em um período específico.