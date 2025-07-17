"use client";

import { generateTenantUrl } from "@/lib/utils";
import { CheckoutButtonSkeleton } from "@/modules/checkout/ui/components/checkout-button";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const CheckoutButton = dynamic(
  () => import("@/modules/checkout/ui/components/checkout-button"),
  { ssr: false, loading: () => <CheckoutButtonSkeleton /> }
);

type Props = {
  slug: string;
};

const Navbar = ({ slug }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.tenants.getOne.queryOptions({
      slug,
    })
  );

  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-screen-lg mx-auto px-4 lg:px-12 flex items-center justify-between h-full">
        <Link
          href={generateTenantUrl(slug)}
          className="flex items-center gap-2"
        >
          {data.image?.url && (
            <Image
              src={data.image.url}
              alt={data.name}
              width={32}
              height={32}
              className="rounded-full border shrink-0 size-8"
            />
          )}
          <p className="text-xl">{data.name}</p>
        </Link>

        <CheckoutButton hideIfEmpty tenantSlug={slug} />
      </div>
    </nav>
  );
};

export const NavbarSkeleton = () => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-screen-lg mx-auto px-4 lg:px-12 flex items-center justify-between h-full">
        <CheckoutButtonSkeleton />
      </div>
    </nav>
  );
};

export default Navbar;
