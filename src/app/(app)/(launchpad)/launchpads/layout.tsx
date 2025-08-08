import Navbar from "@/modules/home/ui/components/navbar";
import Footer from "@/modules/home/ui/components/footer";

import { Metadata } from "next";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: "%s | Store",
    default: "Store",
  },
  description: "Explore our exclusive early access deals and new products",
};

const LaunchpadsLayout = async ({ children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-screen-xl mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default LaunchpadsLayout;
