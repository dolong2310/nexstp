import { DEFAULT_LIMIT } from "@/constants";
import ConversationContent, {
  ConversationContentSkeleton,
} from "@/modules/conversations/ui/components/conversation/conversation-content";
import ConversationForm from "@/modules/conversations/ui/components/conversation/conversation-form";
import ConversationHeader, {
  ConversationHeaderSkeleton,
} from "@/modules/conversations/ui/components/conversation/conversation-header";
import EmptyState from "@/modules/conversations/ui/components/empty-state";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ conversationId: string }>;
}

const handleGetMessages = async (
  queryClient: QueryClient,
  conversationId: string
) => {
  try {
    return await queryClient.fetchInfiniteQuery(
      trpc.conversations.getMessages.infiniteQueryOptions({
        conversationId,
        limit: DEFAULT_LIMIT,
      })
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    redirect("/conversations");
  }
};

const handleGetConversation = async (
  queryClient: QueryClient,
  conversationId: string
) => {
  try {
    return await queryClient.fetchQuery(
      trpc.conversations.getConversation.queryOptions({ conversationId })
    );
  } catch (error) {
    console.error("Error fetching conversation:", error);
    redirect("/conversations");
  }
};

const ConversationPage = async ({ params }: Props) => {
  const { conversationId } = await params;

  const queryClient = getQueryClient();
  const initialMessages = await handleGetMessages(queryClient, conversationId);
  const conversation = await handleGetConversation(queryClient, conversationId);

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
            <ConversationContent initialData={initialMessages} />
          </Suspense>
        </HydrationBoundary>

        <ConversationForm />
      </div>
    </div>
  );
};

export default ConversationPage;
