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

const DesktopItem = ({ label, href, icon: Icon, active, onClick }: Props) => {
  const handleClick = () => {
    onClick && onClick();
  };
  return (
    <li onClick={handleClick}>
      <Link
        href={href}
        className={twMerge(
          "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-500 hover:text-foreground hover:bg-primary-foreground",
          active && "bg-primary-foreground text-foreground",
        )}
      >
        <Icon className="h-6 w-6 shrink-0" />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
};

export default DesktopItem;
