import Logo from "@/components/logo";
import LogoutButton from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useSession from "@/hooks/use-session";
import { Link } from "@/i18n/navigation";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const { user } = useSession();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        noCloseButton
        className="p-0 transition-none bg-secondary-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
          <SheetTitle className="w-fit">
            <Logo />
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="neutral" size="icon" className="size-8">
              <XIcon />
              <span className="sr-only">{t("Close panel")}</span>
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex flex-col overflow-y-auto scrollbar-sm h-full pb-2">
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
                {t("Dashboard")}
              </Link>
              <Link
                href="/conversations"
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                {t("Conversation")}
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
                {t("Sign in")}
              </Link>
              <Link
                href="/sign-up"
                className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
                onClick={() => onOpenChange(false)}
              >
                {t("Sign up")}
              </Link>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NavbarSidebar;
