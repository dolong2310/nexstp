"use client";

import Logo from "@/components/logo";
import LogoutButton from "@/components/logout-button";
import ThemeButton from "@/components/theme-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useSession from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import useConversationNotifications from "@/modules/conversations/hooks/use-conversation-notifications";
import { LayoutDashboardIcon, MenuIcon, MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NavbarSidebar from "./navbar-sidebar";

interface Props {
  fixed?: boolean;
}

const navbarItems = [
  { href: "/", children: "Home" },
  { href: "/launchpads", children: "Launchpads" },
  { href: "/about", children: "About" },
];

const Navbar = ({ fixed }: Props) => {
  const { user } = useSession();
  const { unreadCount } = useConversationNotifications();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const pathname = usePathname();
  // const _pathname = useMemo(() => {
  //   const navbarHref = navbarItems.map((i) => i.href);
  //   if (!navbarHref.includes(pathname)) return "/";
  //   return pathname;
  // }, [pathname, navbarItems]);

  return (
    <nav
      className={cn(
        "h-18 flex border-b-4 items-center justify-between font-medium bg-secondary-background px-4 lg:px-8",
        fixed && "fixed top-0 left-0 right-0 z-20"
      )}
    >
      <div className="flex items-center gap-10">
        <Logo size="lg" />

        <div className="items-center gap-10 hidden lg:flex">
          {navbarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.children}
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4">
        {user ? (
          <>
            <Button asChild variant="default">
              <Link href="/admin">Dashboard</Link>
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="neutral"
                  size="icon"
                  className="relative"
                >
                  <Link href="/conversations">
                    <MessageSquareIcon />
                    {unreadCount > 0 && (
                      <span className="absolute -top-3 -right-3 size-6 flex items-center justify-center text-xs text-white bg-red-500 rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Conversations</p>
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Button asChild variant="neutral">
              <Link prefetch href="/sign-in">
                Sign in
              </Link>
            </Button>
            <Button asChild variant="neutral">
              <Link prefetch href="/sign-up">
                Sign up
              </Link>
            </Button>
          </>
        )}
        <ThemeButton />
        <LogoutButton />
      </div>

      <NavbarSidebar
        items={navbarItems}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />

      <div className="flex lg:hidden items-center justify-center gap-4">
        <ThemeButton />
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
