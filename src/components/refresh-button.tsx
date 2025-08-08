"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/use-global-store";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { RefreshCwIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "./ui/button";

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
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

const RefreshButton = ({
  queryKey,
  variant = "default",
  size = "sm",
}: Props) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const setLoadingGlobal = useGlobalStore((state) => state.setLoadingGlobal);

  const [loading, setLoading] = useState(false);

  const iconSize = useMemo(() => {
    switch (size) {
      case "sm":
      case "icon":
        return "size-4";
      case "lg":
        return "size-5";
      default:
        return "size-5";
    }
  }, [size]);

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="shrink-0"
          disabled={loading}
          onClick={handleRefresh}
        >
          <RefreshCwIcon
            className={cn(
              "transition-transform duration-500",
              iconSize,
              loading && "animate-spin"
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Refresh</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default RefreshButton;
