import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  label: string;
  href: string;
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
};

const MobileItem = ({ label, href, icon: Icon, active, onClick }: Props) => {
  const handleClick = () => {
    onClick && onClick();
  };
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={twMerge(
        "group w-full flex justify-center gap-x-3 p-4 text-sm leading-6 font-semibold text-gray-500 hover:text-foreground hover:bg-primary-foreground",
        active && "bg-primary-foreground text-foreground"
      )}
    >
      <Icon className="h-6 w-6 shrink-0" />
    </Link>
  );
};

export default MobileItem;
