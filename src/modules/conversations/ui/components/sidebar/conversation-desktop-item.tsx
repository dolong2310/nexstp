import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

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
    <Button asChild variant="neutral" size="icon" onClick={handleClick}>
      <Link href={href} className={cn(active && "bg-main!")}>
        <Icon className={cn(active && "dark:fill-white fill-black dark:stroke-white stroke-black")} />
        <span className="sr-only">{label}</span>
      </Link>
    </Button>
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
