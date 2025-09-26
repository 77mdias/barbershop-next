import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes (opcional)
  await prisma.userPromotion.deleteMany();
  await prisma.promotionService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.serviceHistory.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const adminPassword = await hash('admin123', 10);
  const clientPassword = await hash('cliente123', 10);
  const barberPassword = await hash('barbeiro123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@barbershop.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '11999999999'
    }
  });

  const barber1 = await prisma.user.create({
    data: {
      name: 'João Barbeiro',
      email: 'joao@barbershop.com',
      password: barberPassword,
      role: 'BARBER',
      phone: '11988888888'
    }
  });

  const barber2 = await prisma.user.create({
    data: {
      name: 'Pedro Barbeiro',
      email: 'pedro@barbershop.com',
      password: barberPassword,
      role: 'BARBER',
      phone: '11977777777'
    }
  });

  const client1 = await prisma.user.create({
    data: {
      name: 'Carlos Cliente',
      email: 'carlos@email.com',
      password: clientPassword,
      role: 'CLIENT',
      phone: '11966666666'
    }
  });

  const client2 = await prisma.user.create({
    data: {
      name: 'Maria Cliente',
      email: 'maria@email.com',
      password: clientPassword,
      role: 'CLIENT',
      phone: '11955555555'
    }
  });

  console.log('Usuários criados com sucesso!');

  // Criar serviços
  const corte = await prisma.service.create({
    data: {
      name: 'Corte de Cabelo',
      description: 'Corte masculino tradicional',
      duration: 30,
      price: 50.00,
      active: true
    }
  });

  const barba = await prisma.service.create({
    data: {
      name: 'Barba',
      description: 'Barba completa com toalha quente',
      duration: 20,
      price: 35.00,
      active: true
    }
  });

  const combo = await prisma.service.create({
    data: {
      name: 'Combo Corte + Barba',
      description: 'Corte masculino + barba completa',
      duration: 50,
      price: 75.00,
      active: true
    }
  });

  console.log('Serviços criados com sucesso!');

  // Criar histórico de serviços
  const history1 = await prisma.serviceHistory.create({
    data: {
      userId: client1.id,
      serviceId: corte.id,
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      finalPrice: 50.00,
      rating: 5,
      feedback: 'Excelente corte!'
    }
  });

  const history2 = await prisma.serviceHistory.create({
    data: {
      userId: client1.id,
      serviceId: corte.id,
      completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 dias atrás
      finalPrice: 50.00,
      rating: 4,
      feedback: 'Muito bom!'
    }
  });

  console.log('Histórico de serviços criado com sucesso!');

  // Criar voucher
  const voucher = await prisma.voucher.create({
    data: {
      userId: client1.id,
      serviceId: corte.id,
      code: 'CORTE5OFF',
      type: 'DISCOUNT_PERCENTAGE',
      value: 5.00,
      minServices: 5,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias no futuro
    }
  });

  console.log('Voucher criado com sucesso!');

  // Criar promoção
  const promocao = await prisma.promotion.create({
    data: {
      name: 'Desconto de Aniversário',
      description: '15% de desconto no mês do seu aniversário',
      type: 'DISCOUNT_PERCENTAGE',
      value: 15.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias no futuro
      isGlobal: true,
      active: true,
      servicePromotions: {
        create: [
          { serviceId: corte.id },
          { serviceId: barba.id },
          { serviceId: combo.id }
        ]
      }
    }
  });

  // Associar promoção ao cliente
  await prisma.userPromotion.create({
    data: {
      userId: client1.id,
      promotionId: promocao.id
    }
  });

  console.log('Promoção criada com sucesso!');

  // Criar agendamento
  const appointment = await prisma.appointment.create({
    data: {
      userId: client1.id,
      barberId: barber1.id,
      serviceId: corte.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
      notes: 'Primeira vez nesta barbearia'
    }
  });

  console.log('Agendamento criado com sucesso!');

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });