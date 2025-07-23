import getConversationById from "@/lib/server-actions/chat/getConversationById";
import getMessages from "@/lib/server-actions/chat/getMessages";
import ConversationContent from "@/modules/chat/ui/components/conversation/ConversationContent";
import ConversationForm from "@/modules/chat/ui/components/conversation/ConversationForm";
import ConversationHeader from "@/modules/chat/ui/components/conversation/ConversationHeader";
import EmptyState from "@/modules/chat/ui/components/EmptyState";

type Props = {
  params: Promise<{ conversationId: string }>;
};

const ConversationPage = async ({ params }: Props) => {
  const { conversationId } = await params;
  const conversation = await getConversationById(conversationId);
  const messages = await getMessages(conversationId);

  if (!conversation) {
    return (
      <div className="lg:pl-80 h-screen">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-80 h-screen">
      <div className="h-full flex flex-col">
        <ConversationHeader conversation={conversation} />
        <ConversationContent initialMessages={messages} />
        <ConversationForm />
      </div>
    </div>
  );
};

export default ConversationPage;
