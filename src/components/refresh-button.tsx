"use client";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useGlobalStore } from "@/store/use-global-store";

export enum RefreshQueryKeys {
  PRODUCTS = "products",
  CATEGORIES = "categories",
  CONVERSATIONS = "conversations",
  CONVERSATION_CURRENT_USER = "conversation-currentUser",
  CONVERSATION_USERS = "conversation-users",
  LIBRARIES = "libraries",
  TAGS = "tags",
}

interface Props {
  queryKey?: RefreshQueryKeys;
}

const RefreshButton = ({ queryKey }: Props) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const setLoadingGlobal = useGlobalStore((state) => state.setLoadingGlobal);

  const [loading, setLoading] = useState(false);

  const invalidateQuery = () => {
    console.log("queryKey, ", queryKey);
    let _queryKey;
    switch (queryKey) {
      case "products":
        _queryKey = trpc.products.getMany.queryKey();
        break;

      case "categories":
        _queryKey = trpc.categories.getMany.queryKey();
        break;

      case "conversations":
        _queryKey = trpc.conversations.getConversations.queryKey();
        break;

      case "conversation-currentUser":
        _queryKey = trpc.conversations.getCurrentUser.queryKey();
        break;

      case "conversation-users":
        _queryKey = trpc.conversations.getUsers.queryKey();
        break;

      case "libraries":
        _queryKey = trpc.library.getMany.queryKey();
        break;

      case "tags":
        _queryKey = trpc.tags.getMany.queryKey();
        break;

      default:
        break;
    }

    if (!_queryKey) return;
    queryClient.refetchQueries({
      queryKey: [_queryKey?.[0]],
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setLoadingGlobal(true);
    invalidateQuery();
    setTimeout(() => {
      setLoading(false);
      setLoadingGlobal(false);
    }, 500);
  };

  return (
    <Button
      variant="elevated"
      size="sm"
      onClick={handleRefresh}
      disabled={loading}
    >
      <RefreshCwIcon
        className={cn(
          "size-4 transition-transform duration-500",
          loading && "animate-spin"
        )}
      />
    </Button>
  );
};

export default RefreshButton;
