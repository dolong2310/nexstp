import Footer from "@/modules/tenants/ui/components/footer";
import Navbar, { NavbarSkeleton } from "@/modules/tenants/ui/components/navbar";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

const TenantsLayout = async ({ children, params }: Props) => {
  const { slug } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.tenants.getOne.queryOptions({
      slug,
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-third">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar slug={slug} />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1">
        <div className="max-w-screen-lg mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default TenantsLayout;
