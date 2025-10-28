import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatList } from "@/components/chat/ChatList";
import { getUserConversations } from "@/server/chatActions";

/**
 * Página principal de chat
 * Lista todas as conversas do usuário
 */
export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Carregar conversas iniciais
  const result = await getUserConversations({ page: 1, limit: 50 });
  const conversations = result.success && result.data ? result.data : [];

  return (
    <div className="h-screen mt-16 mb-20">
      <ChatList
        currentUserId={session.user.id}
        initialConversations={conversations as any}
      />
    </div>
  );
}
