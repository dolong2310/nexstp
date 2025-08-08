import LogoutButton from "@/components/logout-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useSession from "@/hooks/use-session";
import Link from "next/link";
import React from "react";

type NavbarItem = {
  href: string;
  children: React.ReactNode;
};

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NavbarSidebar = ({ items, open, onOpenChange }: Props) => {
  const { user } = useSession();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none bg-secondary-background"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-2xl">Nexstp</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              onClick={() => onOpenChange(false)}
            >
              {item.children}
            </Link>
          ))}
          <Separator className="my-4" />
          {user ? (
            <>
              <Link
                href="/admin"
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/conversations"
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                Conversation
              </Link>
              <Separator className="my-4" />
              <LogoutButton
                isLabel
                labelClassName="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
              />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                Start selling
              </Link>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NavbarSidebar;
