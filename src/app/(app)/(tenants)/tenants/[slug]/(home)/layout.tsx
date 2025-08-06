import Footer from "@/modules/tenants/ui/components/footer";
import Navbar, { NavbarSkeleton } from "@/modules/tenants/ui/components/navbar";
import { Metadata } from "next";
import React, { Suspense } from "react";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: "%s | Store",
    default: "Store",
  },
  description: "Browse amazing products from our store",
};

const TenantsLayout = async ({ children, params }: Props) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-third">
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar slug={slug} />
      </Suspense>
      <div className="flex-1">
        <div className="max-w-screen-xl mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default TenantsLayout;
