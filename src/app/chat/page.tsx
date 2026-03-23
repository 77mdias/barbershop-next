import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatList } from "@/components/chat/ChatList";
import { getUserConversations } from "@/server/chatActions";
import { PageHero } from "@/components/shared/PageHero";

/**
 * Página principal de chat
 * Lista todas as conversas do usuário
 */
export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getUserConversations({ page: 1, limit: 50 });
  const conversations = result.success && result.data ? result.data : [];

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <PageHero
        badge="Mensagens"
        title="Suas Conversas"
        subtitle="Fale com a equipe e acompanhe atendimentos em tempo real."
        className="py-10 lg:py-14"
      />
      <section className="container mx-auto flex-1 px-4 py-6">
        <ChatList
          currentUserId={session.user.id}
          initialConversations={conversations as any}
        />
      </section>
    </main>
  );
}
