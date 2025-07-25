import ConversationContent, {
  ConversationContentSkeleton,
} from "@/modules/conversations/ui/components/conversation/conversation-content";
import ConversationForm from "@/modules/conversations/ui/components/conversation/conversation-form";
import ConversationHeader, {
  ConversationHeaderSkeleton,
} from "@/modules/conversations/ui/components/conversation/conversation-header";
import EmptyState from "@/modules/conversations/ui/components/empty-state";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
  params: Promise<{ conversationId: string }>;
};

const ConversationPage = async ({ params }: Props) => {
  const { conversationId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.conversations.getMessages.queryOptions({ conversationId })
  );
  const conversation = await queryClient.fetchQuery(
    trpc.conversations.getConversation.queryOptions({ conversationId })
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
