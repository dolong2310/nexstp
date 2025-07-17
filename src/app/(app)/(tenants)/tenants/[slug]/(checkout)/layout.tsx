import Footer from "@/modules/tenants/ui/components/footer";
import Navbar from "@/modules/checkout/ui/components/navbar";
import React from "react";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

const CheckoutLayout = async ({ children, params }: Props) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F0]">
      <Navbar slug={slug} />
      <div className="flex-1">
        <div className="max-w-screen-lg mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutLayout;
