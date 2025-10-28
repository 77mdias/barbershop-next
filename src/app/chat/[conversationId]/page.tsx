import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { getConversationById, getMessages } from "@/server/chatActions";

interface ChatConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

/**
 * Página de conversa individual
 * Exibe as mensagens e permite enviar novas
 */
export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { conversationId } = await params;

  // Buscar dados da conversa
  const conversationResult = await getConversationById(conversationId);

  if (!conversationResult.success || !conversationResult.data) {
    notFound();
  }

  const conversation = conversationResult.data;

  // Buscar mensagens iniciais
  const messagesResult = await getMessages({
    conversationId,
    page: 1,
    limit: 50,
  });

  const messages = messagesResult.success && messagesResult.data ? messagesResult.data : [];

  // Identificar o amigo na conversa
  const friend = conversation.participants.find(
    (p) => p.user.id !== session.user.id
  );

  if (!friend) {
    notFound();
  }

  return (
    <div className="flex flex-col w-full mt-16 items-center h-full">
      <ChatWindow
        conversationId={conversationId}
        currentUserId={session.user.id}
        friendName={friend.user.name}
        friendImage={friend.user.image}
        friendId={friend.user.id}
        initialMessages={messages as any}
      />
    </div>
  );
}
