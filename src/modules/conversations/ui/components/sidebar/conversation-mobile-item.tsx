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

const ConversationMobileItem = ({
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
    <Button asChild variant="neutral">
      <Link
        href={href}
        className={cn(
          "group flex-1 flex items-center justify-center p-4",
          active && "bg-main!"
        )}
        onClick={handleClick}
      >
        <Icon className={cn("h-6 w-6 shrink-0", active && "fill-white")} />
      </Link>
    </Button>
  );
};

export default ConversationMobileItem;
