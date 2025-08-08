import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  label: string;
  href: string;
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
}

const ConversationDesktopItem = ({
  label,
  href,
  icon: Icon,
  active,
  onClick,
}: Props) => {
  const handleClick = () => {
    onClick && onClick();
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="neutral" size="icon" onClick={handleClick}>
          <Link href={href} className={cn(active && "bg-main!")}>
            <Icon
              className={cn(
                active &&
                  "dark:fill-white fill-black dark:stroke-white stroke-black"
              )}
            />
            <span className="sr-only">{label}</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const ConversationDesktopItemSkeleton = () => {
  return (
    <Button asChild variant="neutral" size="icon" disabled>
      <div className="size-10 bg-secondary-background rounded-base animate-pulse" />
    </Button>
  );
};

export default ConversationDesktopItem;
