"use client";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useMemo, useState } from "react";
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
  LAUNCHPADS = "launchpads",
}

interface Props {
  queryKey?: RefreshQueryKeys;
  sizeButton?: "sm" | "default" | "lg" | "icon";
}

const RefreshButton = ({ queryKey, sizeButton = "sm" }: Props) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const setLoadingGlobal = useGlobalStore((state) => state.setLoadingGlobal);

  const [loading, setLoading] = useState(false);

  const iconSize = useMemo(() => {
    switch (sizeButton) {
      case "sm":
      case "icon":
        return "size-4";
      case "lg":
        return "size-5";
      default:
        return "size-5";
    }
  }, [sizeButton]);

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

      case "launchpads":
        _queryKey = trpc.launchpads.getMany.queryKey();
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
      size={sizeButton}
      onClick={handleRefresh}
      disabled={loading}
    >
      <RefreshCwIcon
        className={cn(
          "transition-transform duration-500",
          iconSize,
          loading && "animate-spin"
        )}
      />
    </Button>
  );
};

export default RefreshButton;
