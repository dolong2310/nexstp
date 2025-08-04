"use client";

import { Button } from "@/components/ui/button";
import useSession from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import NavbarSidebar from "./navbar-sidebar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const navbarItems = [
  { href: "/", children: "Home" },
  { href: "/launchpads", children: "Launchpads" },
  { href: "/about", children: "About" },
];

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useSession();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const _pathname = useMemo(() => {
    const navbarHref = navbarItems.map((i) => i.href);
    if (!navbarHref.includes(pathname)) return "/";
    return pathname;
  }, [pathname, navbarItems]);

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-background ">
      <Link href="/" className="pl-4 lg:pl-6 flex items-center">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          nexstp
        </span>
      </Link>

      <div className="items-center gap-4 hidden lg:flex">
        {navbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={_pathname === item.href}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>

      {user ? (
        <div className="hidden lg:flex">
          <Button
            asChild
            variant="secondary"
            className="border-l border-t-0 border-b-0 border-r-0 px-8 h-full rounded-none bg-background hover:bg-feature transition-colors duration-200 text-lg"
          >
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="border-l border-t-0 border-b-0 border-r-0 px-8 h-full rounded-none bg-black text-white hover:bg-feature hover:text-black transition-colors duration-200 text-lg"
          >
            <Link href="/conversations">Conversation</Link>
          </Button>
        </div>
      ) : (
        <div className="hidden lg:flex">
          <Button
            asChild
            variant="secondary"
            className="border-l border-t-0 border-b-0 border-r-0 px-8 h-full rounded-none bg-background hover:bg-feature transition-colors duration-200 text-lg"
          >
            <Link prefetch href="/sign-in">
              Log in
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="border-l border-t-0 border-b-0 border-r-0 px-8 h-full rounded-none bg-black text-white hover:bg-feature hover:text-black transition-colors duration-200 text-lg"
          >
            <Link prefetch href="/sign-up">
              Start selling
            </Link>
          </Button>
        </div>
      )}

      <NavbarSidebar
        items={navbarItems}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />

      <div className="flex lg:hidden items-center justify-center pr-4">
        <Button
          variant="elevated"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};

const NavbarItem = ({
  href,
  children,
  isActive = false,
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-4 text-lg",
        isActive &&
          "bg-black text-white dark:bg-white dark:text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

export default Navbar;
