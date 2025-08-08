"use client";

import Logo from "@/components/logo";
import LogoutButton from "@/components/logout-button";
import ThemeButton from "@/components/theme-button";
import { Button } from "@/components/ui/button";
import useSession from "@/hooks/use-session";
import { LayoutDashboardIcon, MenuIcon, MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NavbarSidebar from "./navbar-sidebar";
import { cn } from "@/lib/utils";

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
        fixed && "fixed top-0 left-0 right-0 z-20",
      )}
    >
      <div className="flex items-center gap-10">
        <Logo />

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
            <Button asChild variant="neutral">
              <Link href="/admin">
                Dashboard <LayoutDashboardIcon />
              </Link>
            </Button>
            <Button asChild variant="neutral" size="icon">
              <Link href="/conversations">
                <MessageSquareIcon />
              </Link>
            </Button>
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
