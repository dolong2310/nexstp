"use client";

import { cn } from "@/lib/utils";
import { CheckoutButtonSkeleton } from "@/modules/checkout/ui/components/checkout-button";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import Link from "next/link";

const CheckoutButton = dynamic(
  () => import("@/modules/checkout/ui/components/checkout-button"),
  { ssr: false, loading: () => <CheckoutButtonSkeleton /> }
);

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface Props {
  slug: string;
}

const Navbar = ({ slug }: Props) => {
  return (
    <nav className="h-20 border-b font-medium bg-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-12 flex items-center justify-between h-full">
        <Link href={process.env.NEXT_PUBLIC_APP_URL!}>
          <span className={cn("text-xl font-semibold", poppins.className)}>
            Nexstp
          </span>
        </Link>

        <CheckoutButton hideIfEmpty tenantSlug={slug} />
      </div>
    </nav>
  );
};

export const NavbarSkeleton = () => {
  return (
    <nav className="h-20 border-b font-medium bg-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-12 flex items-center justify-between h-full">
        <Link href={process.env.NEXT_PUBLIC_APP_URL!}>
          <span className={cn("text-5xl font-semibold", poppins.className)}>
            nexstp
          </span>
        </Link>

        <CheckoutButtonSkeleton />
      </div>
    </nav>
  );
};

export default Navbar;
