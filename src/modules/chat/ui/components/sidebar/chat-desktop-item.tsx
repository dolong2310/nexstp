import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Props = {
  label: string;
  href: string;
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
};

const ChatDesktopItem = ({ label, href, icon: Icon, active, onClick }: Props) => {
  const handleClick = () => {
    onClick && onClick();
  };
  return (
    <Button asChild variant="elevated" size="icon" onClick={handleClick}>
      <Link href={href} className={cn(active && "bg-feature")}>
        <Icon className={cn(active && "fill-white")} />
        <span className="sr-only">{label}</span>
      </Link>
    </Button>
  );
};

export default ChatDesktopItem;
