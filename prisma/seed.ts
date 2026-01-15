import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Limpar dados existentes (opcional)
  await prisma.userPromotion.deleteMany();
  await prisma.promotionService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.serviceHistory.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const adminPassword = await hash("admin123", 10);
  const clientPassword = await hash("cliente123", 10);
  const barberPassword = await hash("barbeiro123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@barbershop.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "11999999999",
      isActive: true,
    },
  });

  const barber1 = await prisma.user.create({
    data: {
      name: "João Barbeiro",
      email: "joao@barbershop.com",
      password: barberPassword,
      role: "BARBER",
      phone: "11988888888",
      isActive: true,
    },
  });

  const barber2 = await prisma.user.create({
    data: {
      name: "Pedro Barbeiro",
      email: "pedro@barbershop.com",
      password: barberPassword,
      role: "BARBER",
      phone: "11977777777",
      isActive: true,
    },
  });

  const client1 = await prisma.user.create({
    data: {
      name: "Carlos Cliente",
      email: "carlos@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "11966666666",
      isActive: true,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: "Maria Cliente",
      email: "maria@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "11955555555",
      isActive: true,
    },
  });

  console.log("Usuários criados com sucesso!");

  // Criar serviços
  const corte = await prisma.service.create({
    data: {
      name: "Corte de Cabelo",
      description: "Corte masculino tradicional",
      duration: 30,
      price: 50.0,
      active: true,
    },
  });

  const barba = await prisma.service.create({
    data: {
      name: "Barba",
      description: "Barba completa com toalha quente",
      duration: 20,
      price: 35.0,
      active: true,
    },
  });

  const combo = await prisma.service.create({
    data: {
      name: "Combo Corte + Barba",
      description: "Corte masculino + barba completa",
      duration: 50,
      price: 75.0,
      active: true,
    },
  });

  console.log("Serviços criados com sucesso!");

  // Criar histórico de serviços
  const history1 = await prisma.serviceHistory.create({
    data: {
      userId: client1.id,
      serviceId: corte.id,
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      finalPrice: 50.0,
      paymentMethod: "CARD",
      rating: 5,
      feedback: "Excelente corte!",
    },
  });

  const history2 = await prisma.serviceHistory.create({
    data: {
      userId: client1.id,
      serviceId: corte.id,
      completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 dias atrás
      finalPrice: 50.0,
      paymentMethod: "PIX",
      rating: 4,
      feedback: "Muito bom!",
    },
  });

  console.log("Histórico de serviços criado com sucesso!");

  // Criar voucher
  const voucher = await prisma.voucher.create({
    data: {
      userId: client1.id,
      serviceId: corte.id,
      code: "CORTE5OFF",
      type: "DISCOUNT_PERCENTAGE",
      value: 5.0,
      minServices: 5,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias no futuro
    },
  });

  console.log("Voucher criado com sucesso!");

  // Criar promoção
  const promocao = await prisma.promotion.create({
    data: {
      name: "Desconto de Aniversário",
      description: "15% de desconto no mês do seu aniversário",
      type: "DISCOUNT_PERCENTAGE",
      value: 15.0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias no futuro
      isGlobal: true,
      active: true,
      servicePromotions: {
        create: [{ serviceId: corte.id }, { serviceId: barba.id }, { serviceId: combo.id }],
      },
    },
  });

  // Associar promoção ao cliente
  await prisma.userPromotion.create({
    data: {
      userId: client1.id,
      promotionId: promocao.id,
    },
  });

  console.log("Promoção criada com sucesso!");

  // Criar agendamento
  const appointment = await prisma.appointment.create({
    data: {
      userId: client1.id,
      barberId: barber1.id,
      serviceId: corte.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
      notes: "Primeira vez nesta barbearia",
    },
  });

  console.log("Agendamento criado com sucesso!");

  // Criar mais clientes para amizades
  const client3 = await prisma.user.create({
    data: {
      name: "Ana Paula Silva",
      email: "ana@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "11944444444",
      isActive: true,
      inviteCode: "ANASILVA",
    },
  });

  const client4 = await prisma.user.create({
    data: {
      name: "Roberto Lima",
      email: "roberto@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "11933333333",
      isActive: true,
      inviteCode: "ROBERLIM",
    },
  });

  const client5 = await prisma.user.create({
    data: {
      name: "Fernanda Costa",
      email: "fernanda@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "11922222222",
      isActive: true,
    },
  });

  const client6 = await prisma.user.create({
    data: {
      name: "Lucas Santos",
      email: "lucas@email.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "11911111111",
      isActive: true,
    },
  });

  const _softDeletedUser = await prisma.user.create({
    data: {
      name: "Cliente Removido",
      email: "removed@barbershop.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "11900000000",
      isActive: false,
      deletedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      deletedById: admin.id,
    },
  });

  console.log("Clientes adicionais criados com sucesso!");

  // Criar amizades (bidirecionais)
  // Carlos é amigo de Maria
  await prisma.friendship.createMany({
    data: [
      { userId: client1.id, friendId: client2.id, status: "ACCEPTED" },
      { userId: client2.id, friendId: client1.id, status: "ACCEPTED" },
    ],
  });

  // Carlos é amigo de Ana
  await prisma.friendship.createMany({
    data: [
      { userId: client1.id, friendId: client3.id, status: "ACCEPTED" },
      { userId: client3.id, friendId: client1.id, status: "ACCEPTED" },
    ],
  });

  // Maria é amiga de Ana
  await prisma.friendship.createMany({
    data: [
      { userId: client2.id, friendId: client3.id, status: "ACCEPTED" },
      { userId: client3.id, friendId: client2.id, status: "ACCEPTED" },
    ],
  });

  // Maria é amiga de Roberto
  await prisma.friendship.createMany({
    data: [
      { userId: client2.id, friendId: client4.id, status: "ACCEPTED" },
      { userId: client4.id, friendId: client2.id, status: "ACCEPTED" },
    ],
  });

  // Ana é amiga de Roberto
  await prisma.friendship.createMany({
    data: [
      { userId: client3.id, friendId: client4.id, status: "ACCEPTED" },
      { userId: client4.id, friendId: client3.id, status: "ACCEPTED" },
    ],
  });

  console.log("Amizades criadas com sucesso!");

  // Criar solicitações de amizade pendentes
  const friendRequest1 = await prisma.friendRequest.create({
    data: {
      senderId: client5.id,
      receiverId: client1.id,
      status: "PENDING",
    },
  });

  const friendRequest2 = await prisma.friendRequest.create({
    data: {
      senderId: client1.id,
      receiverId: client6.id,
      status: "PENDING",
    },
  });

  console.log("Solicitações de amizade criadas com sucesso!");

  // Criar notificações de exemplo
  await prisma.notification.createMany({
    data: [
      // Notificação de solicitação recebida (não lida)
      {
        userId: client1.id, // Carlos recebe
        type: "FRIEND_REQUEST_RECEIVED",
        title: "Nova solicitação de amizade",
        message: "Fernanda Costa enviou uma solicitação de amizade",
        relatedId: friendRequest1.id,
        read: false,
        metadata: {
          senderName: "Fernanda Costa",
          senderId: client5.id,
          senderImage: null,
        },
        createdAt: new Date(),
      },
      // Notificação de solicitação aceita (não lida)
      {
        userId: client2.id, // Maria
        type: "FRIEND_REQUEST_ACCEPTED",
        title: "Solicitação aceita!",
        message: "Carlos Cliente aceitou sua solicitação de amizade",
        relatedId: client1.id,
        read: false,
        metadata: {
          accepterName: "Carlos Cliente",
          accepterId: client1.id,
          accepterImage: null,
        },
        createdAt: new Date(Date.now() - 3600000), // 1h atrás
      },
      // Notificação de código usado (lida)
      {
        userId: client3.id, // Ana
        type: "FRIEND_INVITE_USED",
        title: "Seu código foi usado!",
        message: "Roberto Lima usou seu código de convite",
        relatedId: client4.id,
        read: true,
        metadata: {
          newFriendName: "Roberto Lima",
          newFriendId: client4.id,
          newFriendImage: null,
        },
        createdAt: new Date(Date.now() - 86400000), // 1 dia atrás
      },
      // Notificação de solicitação aceita (lida) - mais antiga
      {
        userId: client4.id, // Roberto
        type: "FRIEND_REQUEST_ACCEPTED",
        title: "Solicitação aceita!",
        message: "Ana Silva aceitou sua solicitação de amizade",
        relatedId: client3.id,
        read: true,
        metadata: {
          accepterName: "Ana Silva",
          accepterId: client3.id,
          accepterImage: null,
        },
        createdAt: new Date(Date.now() - 172800000), // 2 dias atrás
      },
      // Notificação de solicitação recebida (lida) - mais antiga
      {
        userId: client6.id, // Marina recebe
        type: "FRIEND_REQUEST_RECEIVED",
        title: "Nova solicitação de amizade",
        message: "Carlos Cliente enviou uma solicitação de amizade",
        relatedId: friendRequest2.id,
        read: true,
        metadata: {
          senderName: "Carlos Cliente",
          senderId: client1.id,
          senderImage: null,
        },
        createdAt: new Date(Date.now() - 259200000), // 3 dias atrás
      },
      // Notificação de código usado (não lida) - recente
      {
        userId: client1.id, // Carlos
        type: "FRIEND_INVITE_USED",
        title: "Seu código foi usado!",
        message: "Marina Santos usou seu código de convite",
        relatedId: client6.id,
        read: false,
        metadata: {
          newFriendName: "Marina Santos",
          newFriendId: client6.id,
          newFriendImage: null,
        },
        createdAt: new Date(Date.now() - 1800000), // 30 min atrás
      },
    ],
  });

  console.log("Notificações criadas com sucesso!");

  // 🔵 **CRIAR CONVERSAS E MENSAGENS** 🔵
  // Conversa 1: Carlos (client1) e Maria (client2) - AMIGOS
  const conversation1 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: client1.id, lastReadAt: new Date() },
          { userId: client2.id, lastReadAt: new Date(Date.now() - 3600000) }, // 1h atrás (tem não lidas)
        ],
      },
      messages: {
        create: [
          {
            senderId: client1.id,
            content: "Oi Maria! Tudo bem?",
            isRead: true,
            createdAt: new Date(Date.now() - 7200000), // 2h atrás
          },
          {
            senderId: client2.id,
            content: "Oi Carlos! Tudo ótimo e você?",
            isRead: true,
            createdAt: new Date(Date.now() - 7000000),
          },
          {
            senderId: client1.id,
            content: "Também! Vi que você foi no barbeiro ontem. Como ficou?",
            isRead: true,
            createdAt: new Date(Date.now() - 6800000),
          },
          {
            senderId: client2.id,
            content: "Adorei! O João é muito profissional. Recomendo demais!",
            isRead: true,
            createdAt: new Date(Date.now() - 6600000),
          },
          {
            senderId: client1.id,
            content: "Que legal! Vou marcar com ele semana que vem então 😊",
            isRead: false, // Maria ainda não leu
            createdAt: new Date(Date.now() - 1800000), // 30 min atrás
          },
        ],
      },
      lastMessageAt: new Date(Date.now() - 1800000),
    },
  });

  // Conversa 2: Carlos (client1) e João Barbeiro (barber1) - AMIGOS
  const conversation2 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: client1.id, lastReadAt: new Date() },
          { userId: barber1.id, lastReadAt: new Date() },
        ],
      },
      messages: {
        create: [
          {
            senderId: client1.id,
            content: "Oi João! Tem horário disponível quinta-feira às 14h?",
            isRead: true,
            createdAt: new Date(Date.now() - 86400000), // 1 dia atrás
          },
          {
            senderId: barber1.id,
            content: "Oi Carlos! Sim, tem sim. Pode agendar pelo sistema. 👍",
            isRead: true,
            createdAt: new Date(Date.now() - 82800000),
          },
          {
            senderId: client1.id,
            content: "Perfeito! Acabei de agendar. Até quinta!",
            isRead: true,
            createdAt: new Date(Date.now() - 82000000),
          },
          {
            senderId: barber1.id,
            content: "Até lá! ✂️",
            isRead: true,
            createdAt: new Date(Date.now() - 81800000),
          },
        ],
      },
      lastMessageAt: new Date(Date.now() - 81800000),
    },
  });

  // Conversa 3: João Barbeiro (barber1) e Pedro Barbeiro (barber2) - AMIGOS
  const conversation3 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: barber1.id, lastReadAt: new Date(Date.now() - 7200000) }, // Tem não lidas
          { userId: barber2.id, lastReadAt: new Date() },
        ],
      },
      messages: {
        create: [
          {
            senderId: barber2.id,
            content: "João, você viu aquele novo produto de barba que chegou?",
            isRead: true,
            createdAt: new Date(Date.now() - 172800000), // 2 dias atrás
          },
          {
            senderId: barber1.id,
            content: "Vi sim! Testei ontem com um cliente. Ficou ótimo!",
            isRead: true,
            createdAt: new Date(Date.now() - 169200000),
          },
          {
            senderId: barber2.id,
            content: "Que bom! Vou testar hoje também. Valeu pela dica! 👊",
            isRead: true,
            createdAt: new Date(Date.now() - 165600000),
          },
          {
            senderId: barber2.id,
            content: "Ah, e você tem algum cliente disponível pra trocar de horário amanhã? Tive um imprevisto...",
            isRead: false, // João não leu
            createdAt: new Date(Date.now() - 3600000), // 1h atrás
          },
          {
            senderId: barber2.id,
            content: "É pra às 10h da manhã",
            isRead: false, // João não leu
            createdAt: new Date(Date.now() - 3000000),
          },
        ],
      },
      lastMessageAt: new Date(Date.now() - 3000000),
    },
  });

  console.log("Conversas e mensagens criadas com sucesso!");

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
