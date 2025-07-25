import ConversationContent, {
  ConversationContentSkeleton,
} from "@/modules/chat/ui/components/conversation/ConversationContent";
import ConversationForm from "@/modules/chat/ui/components/conversation/ConversationForm";
import ConversationHeader, {
  ConversationHeaderSkeleton,
} from "@/modules/chat/ui/components/conversation/ConversationHeader";
import EmptyState from "@/modules/chat/ui/components/EmptyState";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

type Props = {
  params: Promise<{ conversationId: string }>;
};

const ConversationPage = async ({ params }: Props) => {
  const { conversationId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.chat.getMessages.queryOptions({ conversationId })
  );
  const conversation = await queryClient.fetchQuery(
    trpc.chat.getConversation.queryOptions({ conversationId })
  );

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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<ConversationHeaderSkeleton />}>
            <ConversationHeader />
          </Suspense>
        </HydrationBoundary>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<ConversationContentSkeleton />}>
            <ConversationContent />
          </Suspense>
        </HydrationBoundary>

        <ConversationForm />
      </div>
    </div>
  );
};

export default ConversationPage;
