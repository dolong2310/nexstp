import Footer from "@/modules/tenants/ui/components/footer";
import Navbar from "@/modules/checkout/ui/components/navbar";
import React from "react";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

const CheckoutLayout = async ({ children, params }: Props) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-secondary-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
      <Navbar slug={slug} />
      <div className="flex-1">
        <div className="max-w-screen-xl mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutLayout;
